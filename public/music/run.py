import sys
import subprocess

def download_mp3(url: str):
    cmd = [
        "yt-dlp",
        "-x",                     # extract audio
        "--audio-format", "mp3",  # convert to mp3
        "--audio-quality", "0",   # best quality
        "-o", "%(title)s.%(ext)s",
        url
    ]
    subprocess.run(cmd, check=True)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python script.py <youtube_url>")
        sys.exit(1)
    download_mp3(sys.argv[1])