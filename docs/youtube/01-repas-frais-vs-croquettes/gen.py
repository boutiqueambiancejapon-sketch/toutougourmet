import json, os, sys, base64, subprocess, urllib.request, concurrent.futures as cf
sys.path.insert(0, os.path.dirname(__file__))
from script import CHAPTERS, IMAGES, VOICES
K = os.environ["K"]; D = os.path.dirname(__file__); SYS = open(os.path.join(D,"sysprompt.txt")).read()
def call(model, body):
    req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
        data=json.dumps(body).encode(), headers={"x-goog-api-key": K, "Content-Type": "application/json"})
    return json.load(urllib.request.urlopen(req, timeout=300))
def img(name, prompt):
    out = f"{D}/out/img-{name}.jpg"
    if os.path.exists(out): return name, "skip"
    r = call("gemini-3.1-flash-image", {"contents":[{"parts":[{"text": SYS + "\n\nSUBJECT: " + prompt + "\nAspect ratio 16:9, YouTube video frame."}]}],
        "generationConfig":{"responseModalities":["IMAGE"],"imageConfig":{"aspectRatio":"16:9"}}})
    p = [x for x in r["candidates"][0]["content"]["parts"] if "inlineData" in x][0]["inlineData"]
    raw = f"{D}/gen/{name}.raw"; open(raw,"wb").write(base64.b64decode(p["data"]))
    subprocess.run(["ffmpeg","-y","-loglevel","error","-i",raw,"-vf","scale=1280:-2","-q:v","4",out],check=True)
    return name, "ok"
def voice(v, label, style):
    out = f"{D}/out/voix-{v}.mp3"
    if os.path.exists(out): return v, "skip"
    text = CHAPTERS[0]["vo"] + " " + CHAPTERS[1]["vo"]
    r = call("gemini-3.8-flash-tts", {"contents":[{"parts":[{"text": f"Lis ce texte en français de France. Consigne de jeu : {style}\n\n{text}"}]}],
        "generationConfig":{"responseModalities":["AUDIO"],"speechConfig":{"voiceConfig":{"prebuiltVoiceConfig":{"voiceName":v}}}}})
    p = r["candidates"][0]["content"]["parts"][0]["inlineData"]
    raw = f"{D}/gen/{v}.wav"; open(raw,"wb").write(base64.b64decode(p["data"]))
    subprocess.run(["ffmpeg","-y","-loglevel","error","-i",raw,"-ac","1","-b:a","64k",out],check=True)
    return v, "ok"
if __name__ == "__main__":
  with cf.ThreadPoolExecutor(8) as ex:
    fs = [ex.submit(img,n,p) for n,p in IMAGES.items()] + [ex.submit(voice,*v) for v in VOICES]
    for f in cf.as_completed(fs):
        try: print(f.result())
        except Exception as e: print("ERR", e, getattr(e,'read',lambda:b'')()[:300])
