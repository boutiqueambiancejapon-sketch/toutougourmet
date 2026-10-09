import os, re, sys, subprocess, html
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from script import CHAPTERS
D = os.path.dirname(os.path.abspath(__file__)); R = f"{D}/render"
CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
W, H, FPS = 960, 540, 25
tpl = open(f"{D}/template.html").read()
CSS = tpl[tpl.index("<style>"):tpl.index("</style>")+8]
build_src = open(f"{D}/build.py").read()
ns = {}; exec(build_src[build_src.index("def bars"):build_src.index("def screen")], {"e": html.escape}, ns)
GFX = ns["GFX"]
def run(*a): subprocess.run(a, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
def dur(p): return float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",p],capture_output=True,text=True).stdout)
def shot(body, out):
    page = f"{R}/frame.html"
    open(page,"w").write(f'<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=DM+Sans:wght@400;500;700&display=swap">{CSS}<style>html,body{{margin:0;padding:0;background:#F5F0EA}}</style>{body}')
    run(CHROME,"--headless","--no-sandbox","--hide-scrollbars","--window-size=1280,1000","--virtual-time-budget=3000",f"--screenshot={out}",f"file://{page}")
    from PIL import Image; Image.open(out).crop((0,0,1280,720)).save(out)
def gfx_frame(key, out):
    shot(f'<div class="gfx" style="width:182px;height:102.4px;zoom:7.033">{GFX[key]}</div>', out)
TXT = {"hook":"10 000 gamelles","intro":"Contient des liens affiliés","familles":"Premium vs repas frais",
  "digest":"100 g avalés = 35 g dans les selles","etiquette":"Lis le 1er ingrédient","mythes":"3 idées reçues",
  "prix":"Compare le prix de la 2e livraison","marques":"Code WZU7090 · -35 % box d'essai Dog Chef","outro":"Abonne-toi · toutou-gourmet.com/quiz"}
SEEN = {}
def txt_frame(desc, out, cid=None):
    n = SEEN.get(cid, 0); SEEN[cid] = n + 1
    big = TXT.get(cid, desc) if n == 0 else ("Axelsson et al., Nature, 2013" if cid=="mythes" else "Elmut vs Dog Chef : le comparatif" if cid=="marques" else desc[:60])
    shot(f'<div style="position:absolute;top:0;left:0;width:1280px;height:720px;box-sizing:border-box;display:grid;place-items:center;background:#FFE8B5;color:#1A1109;padding:80px;box-sizing:border-box"><p style="font:700 120px/1.1 Fraunces,serif;text-align:center;margin:0;text-wrap:balance">{html.escape(big)}</p></div>', out)
def title_frame(t, out):
    shot(f'<div style="position:absolute;top:0;left:0;width:1280px;height:720px;box-sizing:border-box;display:grid;place-items:center;background:#1A1109;color:#FAFAF8"><p style="font:700 84px/1.1 Fraunces,serif;margin:0">{html.escape(t)}</p></div>', out)
def clip(src, secs, out, kb):
    n = max(1, int(secs*FPS))
    if kb:  # Ken Burns léger
        vf = f"scale=1920:-2,zoompan=z='min(zoom+0.0006,1.12)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={n}:s={W}x{H}:fps={FPS}"
    else:
        vf = f"scale={W}:{H},fps={FPS}"
    run("ffmpeg","-y","-loop","1","-i",src,"-t",f"{secs:.3f}","-vf",vf+",format=yuv420p","-c:v","libx264","-preset","medium","-crf","30","-r",str(FPS),out)
clips=[]; audio=[]
for i,c in enumerate(CHAPTERS):
    a = f"{D}/vo/{i+1:02d}-{c['id']}.wav"; d = dur(a) + 0.6
    audio.append(a)
    per = d / len(c["screens"])
    for j,(kind,key,desc) in enumerate(c["screens"]):
        out = f"{R}/clips/{i:02d}-{j}.mp4"
        if kind=="img": src=f"{D}/out/img-{key}.jpg"; kb=True
        elif kind=="gfx": src=f"{R}/frames/{c['id']}-{j}.png"; gfx_frame(key,src); kb=False
        else: src=f"{R}/frames/{c['id']}-{j}.png"; txt_frame(desc,src,c['id']); kb=False
        clip(src, per, out, kb); clips.append(out)
    print(c["id"], round(d,1), flush=True)
open(f"{R}/clips.txt","w").write("".join(f"file '{p}'\n" for p in clips))
# audio: chapitres + 0,6 s de silence
parts=[]; 
for a in audio: parts += ["-i",a]
fc = "".join(f"[{k}]apad=pad_dur=0.6[a{k}];" for k in range(len(audio))) + "".join(f"[a{k}]" for k in range(len(audio))) + f"concat=n={len(audio)}:v=0:a=1[out]"
run("ffmpeg","-y",*parts,"-filter_complex",fc,"-map","[out]","-ar","24000","-ac","1",f"{R}/vo-full.wav")
run("ffmpeg","-y","-f","concat","-safe","0","-i",f"{R}/clips.txt","-i",f"{R}/vo-full.wav","-c:v","copy","-c:a","aac","-b:a","80k","-shortest","-movflags","+faststart",f"{R}/rendu-v1.mp4")
run("ffmpeg","-y","-i",f"{R}/vo-full.wav","-b:a","96k",f"{R}/voix-off-complete.mp3")
# miniature A finale
shot('<figure class="thumb" style="width:1280px;height:720px;border-radius:0;margin:0"><img src="'+f"{D}/out/img-thumb-a.jpg"+'" style="width:1280px;height:720px;object-fit:cover"><div class="t" style="left:4%;top:9%;font-size:96px"><span>Croquettes</span><br><span class="hl">ou frais ?</span></div></figure>', f"{R}/miniature-A.png")
run("ffmpeg","-y","-i",f"{R}/miniature-A.png","-q:v","2",f"{R}/miniature-A.jpg")
print("done", dur(f"{R}/rendu-v1.mp4"))
