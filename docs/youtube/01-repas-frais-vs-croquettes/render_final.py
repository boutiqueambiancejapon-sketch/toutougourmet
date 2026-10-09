# Montage final : clips Veo + Ken Burns, fondus crème, voix ralentie, musique Lyria, sous-titres incrustés, écran de fin.
import os, re, sys, subprocess
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from script import CHAPTERS
import render as R0  # réutilise shot(), gfx_frame(), txt_frame()
D = R0.D; F = f"{D}/final"; os.makedirs(f"{F}/seg", exist_ok=True); os.makedirs(f"{F}/vo", exist_ok=True)
W, H, FPS = 1280, 720, 25
TEMPO = 0.93          # voix ralentie de 7 %
GAP = 1.0             # blanc entre chapitres
CREAM = "0xF5F0EA"
VEO = {n: f"{D}/veo/{n}.mp4" for n in ("hook","croquettes","eau","mix","outro")}
END = 15.0

def run(*a): subprocess.run(a, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
dur = R0.dur
ENC = ["-c:v","libx264","-preset","medium","-crf","18","-pix_fmt","yuv420p","-r",str(FPS),"-an"]

def fades(secs):
    return f"fade=in:st=0:d=0.3:color={CREAM},fade=out:st={max(0,secs-0.3):.3f}:d=0.3:color={CREAM}"

def still(src, secs, out, kb):
    n = max(1, round(secs*FPS))
    vf = (f"scale=2560:-2,zoompan=z='min(zoom+0.0005,1.10)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={n}:s={W}x{H}:fps={FPS}" if kb
          else f"scale={W}:{H},fps={FPS}")
    run("ffmpeg","-y","-loop","1","-i",src,"-t",f"{secs:.3f}","-vf",f"{vf},{fades(secs)}",*ENC,out)

def veo_then_still(key, secs, out):
    v = VEO[key]; vd = min(6.0, secs)
    a = out + ".a.mp4"
    run("ffmpeg","-y","-i",v,"-t",f"{vd:.3f}","-vf",f"scale={W}:{H},fps={FPS},fade=in:st=0:d=0.3:color={CREAM}" + (f",fade=out:st={vd-0.3:.3f}:d=0.3:color={CREAM}" if secs-vd < 0.5 else ""),*ENC,a)
    if secs - vd < 0.5: os.replace(a, out); return
    # suite : dernière image du clip Veo, zoom lent (continuité visuelle)
    last = out + ".last.png"; run("ffmpeg","-y","-sseof","-0.1","-i",v,"-frames:v","1","-update","1",last)
    b = out + ".b.mp4"; rest = secs - vd; n = max(1, round(rest*FPS))
    run("ffmpeg","-y","-loop","1","-i",last,"-t",f"{rest:.3f}","-vf",f"scale=2560:-2,zoompan=z='min(zoom+0.0005,1.10)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={n}:s={W}x{H}:fps={FPS},fade=out:st={max(0,rest-0.3):.3f}:d=0.3:color={CREAM}",*ENC,b)
    lst = out + ".txt"; open(lst,"w").write(f"file '{a}'\nfile '{b}'\n")
    run("ffmpeg","-y","-f","concat","-safe","0","-i",lst,"-c","copy",out)

# --- voix ralenties + plan de temps ---
segs, srt, voice_parts, t = [], [], [], 0.0
def ts(x): h=int(x//3600); m=int(x%3600//60); s=x%60; return f"{h:02d}:{m:02d}:{s:06.3f}".replace(".",",")
def chunks(text):
    out = []
    for sent in re.split(r"(?<=[.?!])\s+", text.strip()):
        while len(sent) > 84:
            cut = max(sent.rfind(", ",0,84), sent.rfind(" : ",0,84), sent.rfind(" ",0,84))
            out.append(sent[:cut+1].strip()); sent = sent[cut+1:].strip()
        if sent: out.append(sent)
    return out
for i, c in enumerate(CHAPTERS):
    src = f"{D}/vo/{i+1:02d}-{c['id']}.wav"; slow = f"{F}/vo/{i+1:02d}.wav"
    run("ffmpeg","-y","-i",src,"-af",f"atempo={TEMPO},apad=pad_dur={GAP}","-ar","48000","-ac","1",slow)
    d = dur(slow); voice_parts.append(slow)
    # sous-titres : temps réparti au prorata des caractères
    speech = d - GAP; parts = chunks(c["vo"]); tot = sum(len(p) for p in parts); st = t
    for p in parts:
        en = st + speech * len(p) / tot
        srt.append((st, en - 0.05, p.replace("W, Z, U, sept, zéro, neuf, zéro", "WZU7090").replace("A M Y 2 B", "AMY2B").replace("toutou-gourmet point com", "toutou-gourmet.com")))
        st = en
    # vidéo du chapitre
    per = d / len(c["screens"])
    for j, (kind, key, desc) in enumerate(c["screens"]):
        out = f"{F}/seg/{i:02d}-{j}.mp4"
        if kind == "img" and key in VEO: veo_then_still(key, per, out)
        elif kind == "img": still(f"{D}/out/img-{key}.jpg", per, out, True)
        elif kind == "gfx":
            png = f"{D}/render/frames/{c['id']}-{j}.png"; R0.gfx_frame(key, png); still(png, per, out, False)
        else:
            png = f"{D}/render/frames/{c['id']}-{j}.png"; R0.txt_frame(desc, png, c["id"]); still(png, per, out, False)
        segs.append(out)
    t += d
    print(c["id"], round(d, 1), flush=True)

# --- écran de fin ---
endpng = f"{F}/end.png"
R0.shot('''<div style="position:absolute;top:0;left:0;width:1280px;height:720px;background:#F5F0EA;color:#1A1109;font-family:'DM Sans',sans-serif">
  <p style="position:absolute;left:80px;top:70px;margin:0;font:700 64px/1.1 Fraunces,serif">Merci d'avoir regardé !</p>
  <p style="position:absolute;left:80px;top:160px;margin:0;font:500 30px/1.3 'DM Sans',sans-serif">Le quiz gratuit : <b>toutou-gourmet.com/quiz</b></p>
  <div style="position:absolute;left:80px;top:260px;width:600px;height:338px;border:4px dashed #1A1109;border-radius:16px;display:grid;place-items:center;background:#FFE8B5;font:700 30px 'DM Sans'">Vidéo suivante</div>
  <div style="position:absolute;left:820px;top:300px;width:260px;height:260px;border-radius:50%;border:4px dashed #1A1109;display:grid;place-items:center;background:#C2F0D5;font:700 28px 'DM Sans';text-align:center">S'abonner</div>
</div>''', endpng)
endmp4 = f"{F}/seg/zz-end.mp4"; still(endpng, END, endmp4, False); segs.append(endmp4)
total = t + END
open(f"{F}/segs.txt","w").write("".join(f"file '{s}'\n" for s in segs))
run("ffmpeg","-y","-f","concat","-safe","0","-i",f"{F}/segs.txt","-c","copy",f"{F}/video-nosub.mp4")

# --- audio : voix + musique en boucle (-24 dB sous la voix, remonte sur l'écran de fin) ---
inp = []
for p in voice_parts: inp += ["-i", p]
n = len(voice_parts)
run("ffmpeg","-y",*inp,"-filter_complex","".join(f"[{k}]" for k in range(n)) + f"concat=n={n}:v=0:a=1,apad=pad_dur={END}[v]","-map","[v]",f"{F}/voice.wav")
run("ffmpeg","-y","-stream_loop","-1","-i",f"{D}/music/raw.mpeg","-t",f"{total:.3f}","-af",
    f"volume='if(lt(t,{t:.3f}),0.07,0.35)':eval=frame,afade=in:st=0:d=2,afade=out:st={total-3:.3f}:d=3","-ar","48000","-ac","2",f"{F}/music.wav")
run("ffmpeg","-y","-i",f"{F}/voice.wav","-i",f"{F}/music.wav","-filter_complex","[0]aformat=channel_layouts=stereo[v];[v][1]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[a]","-map","[a]","-ar","48000",f"{F}/mix.wav")

# --- sous-titres ---
with open(f"{F}/sous-titres.srt","w") as fh:
    for k,(a,b,txt) in enumerate(srt,1): fh.write(f"{k}\n{ts(a)} --> {ts(b)}\n{txt}\n\n")
style = "FontName=DM Sans,FontSize=17,PrimaryColour=&H0009111A&,BackColour=&H00EAF0F5&,OutlineColour=&H00EAF0F5&,BorderStyle=3,Outline=6,Shadow=0,MarginV=28,Bold=1"
sub = f"subtitles={F}/sous-titres.srt:fontsdir={D}/fonts:force_style='{style}'"
run("ffmpeg","-y","-i",f"{F}/video-nosub.mp4","-i",f"{F}/mix.wav","-vf",sub,"-c:v","libx264","-preset","medium","-crf","21","-pix_fmt","yuv420p",
    "-c:a","aac","-b:a","160k","-shortest","-movflags","+faststart",f"{F}/toutou-gourmet-repas-frais-vs-croquettes.mp4")
run("ffmpeg","-y","-i",f"{F}/toutou-gourmet-repas-frais-vs-croquettes.mp4","-c:v","libx264","-preset","slow","-crf","31","-vf","scale=960:540",
    "-c:a","aac","-b:a","80k","-movflags","+faststart",f"{F}/apercu.mp4")
print("total", round(total,1))
