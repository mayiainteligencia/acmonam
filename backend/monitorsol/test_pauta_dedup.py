from datetime import datetime as D
from pauta import _sin_duplicados as f

def T(n, k, s, sid): return (n, k, D.fromisoformat(s), {"sesion_id": sid})

def test():
    a = T("Radio Disney 92.1 FM", "disney", "2026-06-17T17:29:37", "A")
    b = T("Disney 92.1", "disney", "2026-06-17T17:29:39", "B")        # misma estacion, otra sesion: duplicado
    a2 = T("Radio Disney 92.1 FM", "disney", "2026-06-17T17:29:42", "A")  # misma sesion: se conserva
    c = T("Radio Disney 92.1 FM", "disney", "2026-06-17T17:35:00", "B")   # fuera de ventana: se conserva
    d = T("Radio Disney 92.1 FM", "radio", "2026-06-17T17:29:38", "B")    # otra keyword: se conserva
    assert f([a, b, a2, c, d]) == [a, d, a2, c]
    assert len(f([b, a])) == 1  # orden de entrada irrelevante

test(); print("ok")
