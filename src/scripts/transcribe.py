#!/usr/bin/env python3
"""
yt_whisper.py
Single-URL helper: download YouTube audio (MP3), keep the MP3, transcribe with Whisper,
and write SRTs to ./srts.

Usage:
  python yt_whisper.py https://www.youtube.com/watch?v=S5SNAlSwt2A
"""

import sys
import shutil
import subprocess
from pathlib import Path


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


def run_whisper(mp3_path: Path, out_dir: Path, model: str = "large-v3", language: str = "ja", device_cpu: bool = True):
    out_dir.mkdir(parents=True, exist_ok=True)

    cmd = [
        "whisper",
        str(mp3_path),
        "--model", model,
        "--language", language,
        "--task", "transcribe",
        "--output_format", "srt",
        "--output_dir", str(out_dir),
    ]
    if device_cpu:
        cmd.extend(["--device", "cpu"])  # quiet FP16 warning on CPU

    print("Transcribing with Whisper...")
    try:
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        msg = (e.stderr.decode() if isinstance(e.stderr, bytes) else (e.stderr or "")).strip()
        print(f"Whisper transcription failed: {msg or e}")
        sys.exit(1)


def main():
    if len(sys.argv) != 2:
        print("Usage: python yt_whisper.py <youtube_url>")
        sys.exit(1)

    url = sys.argv[1]

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
    run_whisper(mp3_path, srts_dir, model="medium", language="ja", device_cpu=True)

    print(f"✅ Done.\n✅ MP3 kept at: {mp3_path.resolve()}\n✅ SRT saved in: {srts_dir.resolve()}")


if __name__ == "__main__":
    main()
