import json, os, sys, base64, subprocess, urllib.request, concurrent.futures as cf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from script import CHAPTERS
from gen import call, SYS, D
TEXT = CHAPTERS[0]["vo"] + " " + CHAPTERS[1]["vo"]
VARIANTS = {
 "Achird-A": ("gemini-3.8-flash-tts", "Parle comme dans une vraie conversation, pas comme une lecture. Rythme légèrement irrégulier, petites pauses naturelles avant les chiffres et les questions, ton détendu, on entend un peu le souffle. Pas d'articulation appuyée, pas de voix publicitaire."),
 "Achird-B": ("gemini-3.8-flash-tts", "Ton de vlog filmé chez soi, comme si tu parlais à un pote dans ta cuisine. Voix un peu plus basse et relâchée, français parlé du quotidien avec les liaisons relâchées, un léger sourire, quelques accélérations et ralentissements naturels."),
 "Achird-C": ("gemini-2.5-pro-preview-tts", "Parle comme dans une vraie conversation, pas comme une lecture. Rythme légèrement irrégulier, petites pauses naturelles, ton détendu et amical, sans articulation appuyée."),
}
def voice(name, model, style):
    r = call(model, {"contents":[{"parts":[{"text": f"Lis ce texte en français de France. Consigne de jeu : {style}\n\n{TEXT}"}]}],
        "generationConfig":{"responseModalities":["AUDIO"],"speechConfig":{"voiceConfig":{"prebuiltVoiceConfig":{"voiceName":"Achird"}}}}})
    p = r["candidates"][0]["content"]["parts"][0]["inlineData"]; raw=f"{D}/gen/{name}.bin"; open(raw,"wb").write(base64.b64decode(p["data"]))
    inp = ["-f","s16le","-ar","24000","-ac","1","-i",raw] if "L16" in p["mimeType"] else ["-i",raw]
    subprocess.run(["ffmpeg","-y","-loglevel","error",*inp,"-ac","1","-b:a","64k",f"{D}/out/voix-{name}.mp3"],check=True); return name
THUMBS = {
 "thumb-a": "YouTube thumbnail base. A friendly golden retriever close-up, head and chest, placed in the RIGHT THIRD of the frame, looking straight at the camera with a curious tilted head. In the lower-left foreground two ceramic bowls: one with dry kibble, one with fresh cooked food (minced meat, carrots, peas). The LEFT HALF of the upper frame is soft out-of-focus warm cream kitchen background (photographic bokeh) so a title can be placed there later without covering the dog. Decorative overlay: a small orange sparkle near the fresh bowl, a few confetti on the right only. The dog's face must be fully visible and well lit.",
 "thumb-b": "YouTube thumbnail base. A beagle with an expressive, slightly surprised face, placed in the RIGHT THIRD of the frame, front paws on a kitchen table edge, looking at a ceramic piggy bank and a few euro coins in the center-right. The LEFT HALF is soft out-of-focus warm cream kitchen background (photographic bokeh), free of important subject matter, so a title can be placed there without covering the dog. Decorative overlay: a hand-drawn amber sparkle above the piggy bank. The dog's face must be fully visible.",
}
def thumb(name, prompt):
    r = call("gemini-3.1-flash-image", {"contents":[{"parts":[{"text": SYS.split("FRAMING (HIGHEST PRIORITY)")[0] + SYS.split("STYLE:",1)[1].join(["STYLE:",""]) if False else SYS + "\n\nOVERRIDE FOR THIS IMAGE: it is a YouTube thumbnail; leaving a soft photographic bokeh area on the left is allowed.\n\nSUBJECT: " + prompt}]}],
        "generationConfig":{"responseModalities":["IMAGE"],"imageConfig":{"aspectRatio":"16:9"}}})
    p=[x for x in r["candidates"][0]["content"]["parts"] if "inlineData" in x][0]["inlineData"]; raw=f"{D}/gen/{name}.raw"; open(raw,"wb").write(base64.b64decode(p["data"]))
    subprocess.run(["ffmpeg","-y","-loglevel","error","-i",raw,"-vf","scale=1280:-2","-q:v","3",f"{D}/out/img-{name}.jpg"],check=True); return name
with cf.ThreadPoolExecutor(6) as ex:
    fs=[ex.submit(voice,n,*v) for n,v in VARIANTS.items()]
    for f in cf.as_completed(fs):
        try: print(f.result())
        except Exception as e: print("ERR",e,getattr(e,'read',lambda:b'')()[:300])
