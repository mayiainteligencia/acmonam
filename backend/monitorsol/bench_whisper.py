"""Benchmark openai-whisper 'base' (lo actual) vs faster-whisper int8 (+/- VAD). Mismas condiciones: 1 hilo por proceso.

Uso (en la VM, con el venv de monitorsol y `pip install faster-whisper`):
  python bench_whisper.py --capturar URL_STREAM --seg 300 --kw radio,disney   # graba 5 min reales y prueba
  python bench_whisper.py audio.wav --kw radio,disney --paralelo 6            # audio propio + prueba de concurrencia

Cada config corre en un proceso aparte: el pico de RAM (RSS) es de ese proceso, sin contaminarse.
"""
import argparse, json, re, resource, subprocess, sys, tempfile, time, unicodedata
from concurrent.futures import ThreadPoolExecutor

CONFIGS = {
    "openai-base":     "openai",                 # = core/transcriber.py hoy
    "fw-int8":         dict(vad=False, beam=1),
    "fw-int8-vad":     dict(vad=True, beam=1),
    "fw-int8-vad-b5":  dict(vad=True, beam=5),   # beam 5 = default de faster-whisper
}


def worker(cfg: str, audio: str):
    t0 = time.time()
    c = CONFIGS[cfg]
    if c == "openai":
        import torch, whisper
        torch.set_num_threads(1)
        m = whisper.load_model("base")
        t1 = time.time()
        txt = m.transcribe(audio, language="es", fp16=False, no_speech_threshold=0.6,
                           condition_on_previous_text=False, temperature=0.0)["text"].strip()
    else:
        from faster_whisper import WhisperModel
        m = WhisperModel("base", device="cpu", compute_type="int8", cpu_threads=1, num_workers=1)
        t1 = time.time()
        segs, _ = m.transcribe(audio, language="es", beam_size=c["beam"], vad_filter=c["vad"],
                               condition_on_previous_text=False, temperature=0.0)
        txt = " ".join(s.text.strip() for s in segs)  # el generador es perezoso: aqui corre todo
    t2 = time.time()
    rss = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
    rss_mb = rss / 1e6 if sys.platform == "darwin" else rss / 1e3  # macOS: bytes, Linux: KB
    print(json.dumps(dict(cfg=cfg, carga=t1 - t0, trans=t2 - t1, rss_mb=rss_mb, texto=txt)))


def rss_mb():
    r = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
    return r / 1e6 if sys.platform == "darwin" else r / 1e3


def worker_multi(n: int, audio: str):
    """UN proceso, UN modelo, n hilos transcribiendo a la vez (n 'estaciones'). Pesos compartidos."""
    from faster_whisper import WhisperModel
    t0 = time.time()
    m = WhisperModel("base", device="cpu", compute_type="int8", cpu_threads=1, num_workers=n)
    t1 = time.time()

    def uno(_):
        s = time.time()
        segs, _i = m.transcribe(audio, language="es", beam_size=1, vad_filter=True,
                                condition_on_previous_text=False, temperature=0.0)
        txt = " ".join(x.text.strip() for x in segs)
        return time.time() - s, txt

    with ThreadPoolExecutor(n) as ex:
        rs = list(ex.map(uno, range(n)))
    t2 = time.time()
    print(json.dumps(dict(carga=t1 - t0, pared=t2 - t1, por_job=sum(r[0] for r in rs) / n,
                          rss_mb=rss_mb(), n_texto=len({r[1] for r in rs}))))


def correr(cfg, audio):
    out = subprocess.run([sys.executable, __file__, "--worker", cfg, audio], capture_output=True, text=True)
    try:
        return json.loads(out.stdout.strip().splitlines()[-1])
    except Exception:
        sys.exit(f"[{cfg}] fallo:\n{out.stderr[-800:]}")


def norm(s):
    return unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode().lower()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio", nargs="?")
    ap.add_argument("--capturar"); ap.add_argument("--seg", type=int, default=300)
    ap.add_argument("--kw", default=""); ap.add_argument("--paralelo", type=int, default=0)
    ap.add_argument("--worker"); ap.add_argument("--multi", type=int); a = ap.parse_args()
    if a.worker:
        return worker(a.worker, a.audio)
    if a.multi:
        return worker_multi(a.multi, a.audio)
    audio = a.audio
    if a.capturar:
        audio = tempfile.mktemp(suffix=".wav")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", a.capturar, "-t", str(a.seg),
                        "-ar", "16000", "-ac", "1", audio], check=True)
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of",
                                "csv=p=0", audio], capture_output=True, text=True).stdout)
    kws = [norm(k) for k in a.kw.split(",") if k]
    print(f"audio: {audio}  ({dur:.0f} s)\n")
    print(f"{'config':16} {'carga s':>8} {'trans s':>8} {'xRT':>6} {'RAM MB':>7}  palabras  keywords")
    for cfg in CONFIGS:
        r = correr(cfg, audio)
        t = norm(r["texto"])
        hits = {k: len(re.findall(r"\b" + re.escape(k) + r"\b", t)) for k in kws}
        print(f"{cfg:16} {r['carga']:8.1f} {r['trans']:8.1f} {dur / r['trans']:6.1f} {r['rss_mb']:7.0f}"
              f"  {len(t.split()):8}  {hits}")
        open(f"bench_{cfg}.txt", "w").write(r["texto"])  # para comparar a ojo
    if a.paralelo:
        print(f"\nConcurrencia: {a.paralelo} procesos a la vez (1 hilo c/u), mismo audio")
        for cfg in ("openai-base", "fw-int8-vad"):
            t0 = time.time()
            with ThreadPoolExecutor(a.paralelo) as ex:
                rs = list(ex.map(lambda _: correr(cfg, audio), range(a.paralelo)))
            tot = time.time() - t0
            print(f"{cfg:16} pared {tot:6.1f} s  RAM suma {sum(r['rss_mb'] for r in rs):7.0f} MB"
                  f"  trans/proc {sum(r['trans'] for r in rs) / len(rs):6.1f} s  xRT/proc {dur / (sum(r['trans'] for r in rs) / len(rs)):5.1f}")
        out = subprocess.run([sys.executable, __file__, "--multi", str(a.paralelo), audio], capture_output=True, text=True)
        try:
            r = json.loads(out.stdout.strip().splitlines()[-1])
        except Exception:
            sys.exit(f"[multi] fallo:\n{out.stderr[-800:]}")
        print(f"{'fw-1proc-'+str(a.paralelo)+'hilos':16} pared {r['pared']:6.1f} s  RAM TOTAL {r['rss_mb']:7.0f} MB"
              f"  trans/job {r['por_job']:6.1f} s  xRT/job {dur / r['por_job']:5.1f}  (carga {r['carga']:.1f} s)")
        print(f"  -> {a.paralelo} estaciones en 1 proceso. Rendimiento = {a.paralelo * dur / r['pared']:.1f} s de audio por s real."
              f" Si 'trans/job' sigue < {dur:.0f} s, aguanta tiempo real.")
    print("\nTranscripciones en bench_<config>.txt. Ajusta a mano: RAM total = suma de procesos + SO.")


if __name__ == "__main__":
    main()
