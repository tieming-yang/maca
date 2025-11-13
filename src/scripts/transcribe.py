#!/usr/bin/env python3
"""
yt_whisper.py
Single-URL helper: download YouTube audio, transcribe with Whisper,
write SRTs to ./srts, and clean up the intermediate audio file.

Usage:
  python transcribe.py https://www.youtube.com/watch?v=S5SNAlSwt2A \
    [--max-words-per-line N] [--word-timestamps {true,false}]
"""

import argparse
import sys
import shutil
import subprocess
from pathlib import Path
from typing import Optional


def ensure_on_path(cmd: str):
    if shutil.which(cmd) is None:
        print(f"Error: '{cmd}' is not on PATH. Please install it and try again.")
        sys.exit(1)


def download_audio_and_get_path(url: str, out_template: str, audio_format: str) -> Path:
    """
    Uses yt-dlp to extract audio and prints the *final* postprocessed filepath.
    """
    print("Downloading audio and resolving final path...")
    try:
        proc = subprocess.run(
            [
                "yt-dlp",
                "-x", "--audio-format", audio_format,
                "-o", out_template,
                "--no-simulate",
                "--print", "after_move:filepath",
                url,
            ],
            capture_output=True,
            text=True,
            check=True,
        )
    except subprocess.CalledProcessError as e:
        msg = e.stderr.strip() or e.stdout.strip() or str(e)
        print(f"yt-dlp failed: {msg}")
        sys.exit(1)

    # yt-dlp may print extra newlines; take the last non-empty line
    lines = [ln.strip() for ln in proc.stdout.splitlines() if ln.strip()]
    if not lines:
        print("yt-dlp did not return a postprocessed filepath.")
        sys.exit(1)

    audio_path = Path(lines[-1])
    if not audio_path.exists():
        print(f"Could not find audio at: {audio_path}")
        # Offer a hint by listing current directory files
        here = Path(".").resolve()
        print(f"Files in {here}:")
        for p in here.iterdir():
            print(" -", p.name)
        sys.exit(1)

    print(f"Audio ready: {audio_path.name}")
    return audio_path


def run_whisper(
    audio_path: Path,
    out_dir: Path,
    model: str = "large-v3",
    language: str = "ja",
    device: str = "cpu",
    max_words_per_line: Optional[int] = None,
    word_timestamps: str = "True",
    temperature: float = 0.0,
    temperature_increment_on_fallback: float = 0.2,
    best_of: int = 5,
    beam_size: int = 5,
    condition_on_previous_text: bool = False,
    vad_filter: bool = True,
    no_speech_threshold: float = 0.45,
    hallucination_silence_threshold: float = 2.0,
    initial_prompt: Optional[str] = None,
):
    out_dir.mkdir(parents=True, exist_ok=True)

    cmd = [
        "whisper",
        str(audio_path),
        "--model", model,
        "--language", language,
        "--task", "transcribe",
        "--output_format", "srt",
        "--output_dir", str(out_dir),
        "--hallucination_silence_threshold", str(hallucination_silence_threshold),
        "--no_speech_threshold", str(no_speech_threshold),
        "--temperature", str(temperature),
        "--temperature_increment_on_fallback", str(temperature_increment_on_fallback),
        "--best_of", str(best_of),
        "--beam_size", str(beam_size),
        "--condition_on_previous_text", str(condition_on_previous_text),
        "--word_timestamps", word_timestamps,
    ]
    if max_words_per_line is not None:
        cmd.extend(["--max_words_per_line", str(max_words_per_line)])
    if device:
        cmd.extend(["--device", device])
    if initial_prompt:
        cmd.extend(["--initial_prompt", initial_prompt])

    print("Transcribing with Whisper...")
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        msg = (e.stderr.decode() if isinstance(e.stderr, bytes) else (e.stderr or "")).strip()
        print(f"Whisper transcription failed: {msg or e}")
        sys.exit(1)


def parse_args():
    parser = argparse.ArgumentParser(
        description="Download a YouTube video's audio, run Whisper transcription, and optionally tweak line splitting."
    )
    parser.add_argument("url", help="YouTube URL to download and transcribe.")
    parser.add_argument(
        "--audio-format",
        default="wav",
        help="Forwarded to yt-dlp as --audio-format (e.g., wav, best, mp3).",
    )
    parser.add_argument(
        "--model",
        default="large-v3",
        help="Whisper model to use (e.g., medium, large-v3).",
    )
    parser.add_argument(
        "--device",
        default="cpu",
        help="Computation device for Whisper (cpu, cuda, cuda:0, etc.).",
    )
    parser.add_argument(
        "--max-words-per-line",
        type=int,
        default=None,
        help="Forwarded to Whisper as --max_words_per_line to control SRT line length.",
    )
    parser.add_argument(
        "--word-timestamps",
        choices=["true", "false", "True", "False"],
        default="True",
        help="Forwarded to Whisper as --word_timestamps for word-level timing.",
    )
    parser.add_argument(
        "--temperature",
        type=float,
        default=0.0,
        help="Sampling temperature forwarded to Whisper.",
    )
    parser.add_argument(
        "--temperature-increment-on-fallback",
        type=float,
        default=0.2,
        help="Forwarded to Whisper as --temperature_increment_on_fallback.",
    )
    parser.add_argument(
        "--best-of",
        type=int,
        default=5,
        help="Forwarded to Whisper as --best_of for sampling.",
    )
    parser.add_argument(
        "--beam-size",
        type=int,
        default=5,
        help="Forwarded to Whisper as --beam_size for beam search.",
    )
    parser.add_argument(
        "--condition-on-previous-text",
        dest="condition_on_previous_text",
        action="store_true",
        help="Allow Whisper to condition on earlier segments.",
    )
    parser.set_defaults(condition_on_previous_text=False)
    parser.add_argument(
        "--initial-prompt",
        default=None,
        help="Initial prompt passed to Whisper to prime decoding.",
    )
    parser.add_argument(
        "--no-vad-filter",
        dest="vad_filter",
        action="store_false",
        help="Disable Whisper VAD filter (enabled by default).",
    )
    parser.set_defaults(vad_filter=True)
    parser.add_argument(
        "--no-speech-threshold",
        type=float,
        default=0.45,
        help="Forwarded as --no_speech_threshold to trim low-confidence spans.",
    )
    parser.add_argument(
        "--hallucination-silence-threshold",
        type=float,
        default=2.0,
        help="Forwarded as --hallucination_silence_threshold (seconds).",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    url = args.url

    # Dependencies
    ensure_on_path("yt-dlp")
    ensure_on_path("whisper")
    ensure_on_path("ffmpeg")  # Whisper relies on ffmpeg to read audio

    # Safer output template to avoid duplicate/ambiguous names:
    out_template = "%(title)s.%(id)s.%(ext)s"

    # 1) Download audio and capture the final postprocessed path
    audio_path = download_audio_and_get_path(url, out_template, args.audio_format)

    # 2) Transcribe with Whisper (SRT to ./srts; source audio kept)
    srts_dir = Path("./srts")
    run_whisper(
        audio_path,
        srts_dir,
        model=args.model,
        language="ja",
        device=args.device,
        max_words_per_line=args.max_words_per_line,
        word_timestamps=args.word_timestamps.capitalize(),
        temperature=args.temperature,
        temperature_increment_on_fallback=args.temperature_increment_on_fallback,
        best_of=args.best_of,
        beam_size=args.beam_size,
        condition_on_previous_text=args.condition_on_previous_text,
        vad_filter=args.vad_filter,
        no_speech_threshold=args.no_speech_threshold,
        hallucination_silence_threshold=args.hallucination_silence_threshold,
        initial_prompt=args.initial_prompt,
    )

    try:
        audio_path.unlink()
        audio_status = "deleted"
    except FileNotFoundError:
        audio_status = "already removed"
    except OSError as err:
        audio_status = f"could not be removed ({err})"

    print(f"✅ Done.\n✅ Audio {audio_status}: {audio_path.resolve()}\n✅ SRT saved in: {srts_dir.resolve()}")


if __name__ == "__main__":
    main()
