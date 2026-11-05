#!/usr/bin/env python3
"""Muestrea CPU/RAM de monitorsol vs emisoras activas -> CSV + resumen de capacidad.

Uso:  python3 medir_recursos.py            # muestrea cada 5s hasta Ctrl-C
      python3 medir_recursos.py --resumen  # solo lee el CSV y calcula capacidad
"""
import csv, json, os, subprocess, sys, time, urllib.request
from datetime import datetime

CSV = os.path.join(os.path.dirname(os.path.abspath(__file__)), "consumo.csv")
INTERVALO = 5
CORES = os.cpu_count() or 1
# ponytail: filtro por nombre de proceso. Si corres otro ffmpeg en la Mac,
# se cuenta de mas; usar cgroups/psutil por PID-padre si eso llega a importar.
# spawn_main = los workers del pool de transcripcion, donde vive casi todo el CPU.
PATRON = ("uvicorn", "ffmpeg", "spawn_main")


def muestra_ps(salida_ps=None):
    """Suma %cpu y RSS(MB) de los procesos de monitorsol. Devuelve (cpu, mb, n_ffmpeg)."""
    txt = salida_ps if salida_ps is not None else subprocess.run(
        ["ps", "-Ao", "%cpu,rss,command"], capture_output=True, text=True).stdout
    cpu = rss = 0.0
    ffmpegs = 0
    for linea in txt.splitlines()[1:]:
        partes = linea.split(None, 2)
        if len(partes) < 3:
            continue
        c, r, cmd = partes
        if not any(p in cmd for p in PATRON):
            continue
        try:
            cpu += float(c)
            rss += float(r) / 1024
        except ValueError:
            continue
        if "ffmpeg" in cmd:
            ffmpegs += 1
    return round(cpu, 1), round(rss, 1), ffmpegs


def sesiones_activas():
    try:
        with urllib.request.urlopen("http://localhost:8001/monitor/sessions", timeout=3) as r:
            return len(json.load(r).get("sesiones", []))
    except Exception:
        return -1


def resumen():
    filas = [f for f in csv.DictReader(open(CSV)) if int(f["emisoras"]) > 0]
    if not filas:
        return print("Sin muestras con emisoras activas todavia.")
    niveles = {}
    for f in filas:
        niveles.setdefault(int(f["emisoras"]), []).append(
            (float(f["cpu_pct"]), float(f["ram_mb"])))
    print(f"cores={CORES} ({CORES*100}% CPU total)\n")
    print("emisoras  muestras   CPU%   RAM MB")
    xs, ys = [], []
    for n in sorted(niveles):
        m = niveles[n]
        cpu = sum(c for c, _ in m) / len(m)
        ram = sum(r for _, r in m) / len(m)
        print(f"{n:>8}  {len(m):>8}  {cpu:>5.1f}  {ram:>7.0f}")
        xs.append(n)
        ys.append(cpu)
    # Tendencia: 6 bloques iguales. Si la RAM sube bloque a bloque, hay fuga.
    if len(filas) >= 12:
        print("\ntendencia (para dejarlo dias corriendo):")
        b = len(filas) // 6
        for i in range(6):
            tramo = filas[i * b:(i + 1) * b]
            print(f"  {tramo[0]['ts'][11:16]}  cpu {sum(float(x['cpu_pct']) for x in tramo)/len(tramo):>6.0f}%"
                  f"   ram {sum(float(x['ram_mb']) for x in tramo)/len(tramo):>6.0f} MB")
    if len(set(xs)) < 2:
        return print("\nMide con >=2 cantidades distintas de emisoras para separar fijo/marginal.")
    import statistics
    r = statistics.linear_regression(xs, ys)
    print(f"\nCPU = {r.intercept:.1f}% fijo + {r.slope:.1f}% por emisora")
    if r.slope > 0:
        cap = (CORES * 100 - r.intercept) / r.slope
        print(f"capacidad de esta maquina: ~{cap:.0f} emisoras (al 70%: ~{cap*0.7:.0f})")


def main():
    nuevo = not os.path.exists(CSV)
    with open(CSV, "a", newline="") as fh:
        w = csv.writer(fh)
        if nuevo:
            w.writerow(["ts", "emisoras", "cpu_pct", "ram_mb", "ffmpegs"])
        print(f"Muestreando cada {INTERVALO}s -> {CSV}  (Ctrl-C para parar)")
        while True:
            cpu, mb, ff = muestra_ps()
            n = sesiones_activas()
            w.writerow([datetime.now().isoformat(timespec="seconds"), n, cpu, mb, ff])
            fh.flush()
            print(f"  emisoras={n:>3}  cpu={cpu:>6}%  ram={mb:>7} MB  ffmpeg={ff}")
            time.sleep(INTERVALO)


def _test():
    ps = ("%CPU    RSS COMMAND\n"
          "12.5  524288 python -m uvicorn main:app\n"
          " 3.0  102400 ffmpeg -i http://radio\n"
          "99.0 8000000 Google Chrome\n")
    assert muestra_ps(ps) == (15.5, 612.0, 1), muestra_ps(ps)
    print("ok")


if __name__ == "__main__":
    if "--test" in sys.argv:
        _test()
    elif "--resumen" in sys.argv:
        resumen()
    else:
        try:
            main()
        except KeyboardInterrupt:
            print()
            resumen()
