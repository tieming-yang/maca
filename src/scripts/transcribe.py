#!/usr/bin/env python3
"""
yt_whisper.py
Single-URL helper: download YouTube audio (MP3), transcribe with Whisper,
write SRTs to ./srts, and clean up the intermediate MP3.

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


def download_mp3_and_get_path(url: str, out_template: str) -> Path:
    """
    Uses yt-dlp to extract audio and prints the *final* postprocessed filepath.
    """
    print("Downloading audio and resolving final path...")
    try:
        proc = subprocess.run(
            [
                "yt-dlp",
                "-x", "--audio-format", "mp3",
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

    mp3_path = Path(lines[-1])
    if not mp3_path.exists():
        print(f"Could not find MP3 at: {mp3_path}")
        # Offer a hint by listing current directory files
        here = Path(".").resolve()
        print(f"Files in {here}:")
        for p in here.iterdir():
            print(" -", p.name)
        sys.exit(1)

    print(f"MP3 ready: {mp3_path.name}")
    return mp3_path


def run_whisper(
    mp3_path: Path,
    out_dir: Path,
    model: str = "large-v3",
    language: str = "ja",
    device_cpu: bool = True,
    max_words_per_line: Optional[int] = None,
    word_timestamps: str = "True",
):
    out_dir.mkdir(parents=True, exist_ok=True)

    cmd = [
        "whisper",
        str(mp3_path),
        "--model", model,
        "--language", language,
        "--task", "transcribe",
        "--output_format", "srt",
        "--output_dir", str(out_dir),
        "--hallucination_silence_threshold", "5",
        "--word_timestamps", word_timestamps,
    ]
    if max_words_per_line is not None:
        cmd.extend(["--max_words_per_line", str(max_words_per_line)])
    if device_cpu:
        cmd.extend(["--device", "cpu"])  # quiet FP16 warning on CPU

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

    # 1) Download MP3 and capture the final postprocessed path
    mp3_path = download_mp3_and_get_path(url, out_template)

    # 2) Transcribe with Whisper (SRT to ./srts; MP3 kept)
    srts_dir = Path("./srts")
    run_whisper(
        mp3_path,
        srts_dir,
        model="medium",
        language="ja",
        device_cpu=True,
        max_words_per_line=args.max_words_per_line,
        word_timestamps=args.word_timestamps.capitalize(),
    )

    try:
        mp3_path.unlink()
        mp3_status = "deleted"
    except FileNotFoundError:
        mp3_status = "already removed"
    except OSError as err:
        mp3_status = f"could not be removed ({err})"

    print(f"✅ Done.\n✅ MP3 {mp3_status}: {mp3_path.resolve()}\n✅ SRT saved in: {srts_dir.resolve()}")


if __name__ == "__main__":
    main()
