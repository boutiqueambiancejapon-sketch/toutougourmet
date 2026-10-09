import os, sys, base64, subprocess, time, concurrent.futures as cf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from script import CHAPTERS
from gen import call, D
STYLE = "Parle comme dans une vraie conversation, pas comme une lecture. Rythme légèrement irrégulier, petites pauses naturelles, ton détendu et amical, sans articulation appuyée."
def vo(i, c):
    out = f"{D}/vo/{i+1:02d}-{c['id']}.mp3"
    if os.path.exists(out): return out
    for attempt in range(4):
        try:
            r = call("gemini-2.5-pro-preview-tts", {"contents":[{"parts":[{"text": f"Lis ce texte en français de France. Consigne de jeu : {STYLE}\n\n{c['vo']}"}]}],
                "generationConfig":{"responseModalities":["AUDIO"],"speechConfig":{"voiceConfig":{"prebuiltVoiceConfig":{"voiceName":"Achird"}}}}})
            p = r["candidates"][0]["content"]["parts"][0]["inlineData"]; break
        except Exception as e:
            print("retry", c['id'], e); time.sleep(5 * 2**attempt)
    raw = f"{D}/gen/vo-{c['id']}.pcm"; open(raw,"wb").write(base64.b64decode(p["data"]))
    wav = f"{D}/vo/{i+1:02d}-{c['id']}.wav"
    subprocess.run(["ffmpeg","-y","-loglevel","error","-f","s16le","-ar","24000","-ac","1","-i",raw,wav],check=True)
    subprocess.run(["ffmpeg","-y","-loglevel","error","-i",wav,"-b:a","96k",out],check=True)
    return out
if __name__ == "__main__":
 with cf.ThreadPoolExecutor(4) as ex:
    for f in cf.as_completed([ex.submit(vo,i,c) for i,c in enumerate(CHAPTERS)]): print(f.result())
