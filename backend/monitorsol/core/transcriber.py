from concurrent.futures import ProcessPoolExecutor

import whisper

from config import MODELO_WHISPER, WORKERS

_modelo = None
_pool = None


def get_modelo():
    global _modelo
    if _modelo is None:
        print(f"[transcriber] Cargando modelo Whisper '{MODELO_WHISPER}'...")
        import torch
        # ponytail: 1 hilo por proceso. El paralelismo lo da el pool, no OpenMP;
        # sin esto los workers se pelean por los cores y todo va mas lento.
        torch.set_num_threads(1)
        _modelo = whisper.load_model(MODELO_WHISPER)
        print("[transcriber] Modelo listo.")
    return _modelo


def _transcribir_en_proceso(audio_path: str, keywords: list) -> str:
    modelo = get_modelo()
    # Sin initial_prompt: Whisper lo "transcribia" como audio en silencio/musica.
    return modelo.transcribe(
        audio_path, language="es", fp16=False, no_speech_threshold=0.6,
        condition_on_previous_text=False, temperature=0.0,
    )["text"].strip()


def _get_pool():
    global _pool
    if _pool is None:
        # max_tasks_per_child: recicla el worker cada 200 chunks (~17 min de audio)
        # para que una fuga de memoria de whisper no crezca durante dias. Recargar
        # el modelo cuesta ~2s, o sea 0.2% de overhead.
        _pool = ProcessPoolExecutor(max_workers=WORKERS, max_tasks_per_child=200)
        print(f"[transcriber] Pool de {WORKERS} procesos de transcripción")
    return _pool


def transcribir(audio_path: str, keywords: list) -> str:
    """Transcribe un chunk en un proceso aparte.

    PyTorch se corrompe si varios hilos llaman transcribe() sobre el mismo modelo
    (SIGSEGV en cblas_sgemm); session_manager los lanza con run_in_executor, o sea
    en hilos. Cada proceso del pool tiene su propia copia del modelo, sin memoria
    compartida. El techo pasa de 2 emisoras a WORKERS x ~3.
    """
    return _get_pool().submit(_transcribir_en_proceso, audio_path, keywords).result()
