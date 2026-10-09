# Motion design Toutou Gourmet : écrans chiffrés et cartons texte animés, dessinés image par image (PIL, rendu 2x puis réduit).
import os, subprocess
from PIL import Image, ImageDraw, ImageFont
D = os.path.dirname(os.path.abspath(__file__)); FD = f"{D}/fonts"
W, H, FPS, SS = 1280, 720, 25, 3   # coordonnées en 1280x720, dessin en 3840x2160
OUT = (1920, 1080)
CREAM, CREAM2, INK, MUTED = (245,240,234), (250,250,248), (26,17,9), (107,93,79)
ROSE, BLEU, AMBRE, VERT, ORANGE, WHITE = (255,214,227), (200,220,255), (255,232,181), (194,240,213), (232,98,42), (255,255,255)
_f = {}
def font(name, size):
    k = (name, size)
    if k not in _f: _f[k] = ImageFont.truetype(f"{FD}/{name}.ttf", size * SS)
    return _f[k]
DISP = lambda s: font("Fraunces-Bold", s)
BOLD = lambda s: font("DMSans-Bold", s)
MED = lambda s: font("DMSans-Medium", s)
REG = lambda s: font("DMSans-Regular", s)

def ease(p): p = max(0.0, min(1.0, p)); return 1 - (1 - p) ** 3
def back(p):  # léger dépassement
    p = max(0.0, min(1.0, p)); c = 1.4; return 1 + (c + 1) * (p - 1) ** 3 + c * (p - 1) ** 2
def prog(t, t0, d=0.5): return ease((t - t0) / d)

class Frame:
    def __init__(self, bg=CREAM):
        self.im = Image.new("RGB", (W * SS, H * SS), bg); self.d = ImageDraw.Draw(self.im)
    def layer(self, p, fn, dy=40, dx=0):
        """dessine fn(draw, ox, oy) avec fondu + glissement selon p (0..1)"""
        if p <= 0: return
        ox, oy = int(dx * (1 - p) * SS), int(dy * (1 - p) * SS)
        if p >= 1: fn(self.d, 0, 0); return
        lay = Image.new("RGBA", self.im.size, (0, 0, 0, 0)); fn(ImageDraw.Draw(lay), ox, oy)
        a = lay.getchannel("A").point(lambda v: int(v * p)); lay.putalpha(a)
        self.im.paste(lay, (0, 0), lay)
    def out(self): return self.im.resize(OUT, Image.LANCZOS)

def S(*v): return [int(x * SS) for x in v]
def rrect(d, box, fill, r=18, outline=INK, w=3): d.rounded_rectangle(S(*box), radius=r * SS, fill=fill, outline=outline, width=w * SS)
def text(d, xy, s, f, fill=INK, anchor="la"): d.text(S(*xy), s, font=f, fill=fill, anchor=anchor)

# ---------- scènes ----------
def sc_versus(t, T):
    fr = Frame()
    fr.layer(prog(t, 0.1, 0.6), lambda d, ox, oy: (rrect(d, (90 + ox/SS, 260, 560 + ox/SS, 460), ROSE, 26), text(d, (325 + ox/SS, 360), "CROQUETTES", DISP(58), anchor="mm")), dx=-120, dy=0)
    fr.layer(prog(t, 0.4, 0.6), lambda d, ox, oy: (rrect(d, (720 + ox/SS, 260, 1190 + ox/SS, 460), VERT, 26), text(d, (955 + ox/SS, 360), "REPAS FRAIS", DISP(58), anchor="mm")), dx=120, dy=0)
    s = back((t - 0.9) / 0.5)
    if s > 0: fr.d.text(S(640, 360), "vs", font=DISP(max(1, int(80 * s))), fill=ORANGE, anchor="mm")
    return fr.out()

def sc_logo(t, T):
    fr = Frame(CREAM2)
    fr.layer(prog(t, 0.1, 0.7), lambda d, ox, oy: text(d, (640, 330 + oy/SS), "Toutou Gourmet", DISP(96), anchor="mm"))
    fr.layer(prog(t, 0.6, 0.6), lambda d, ox, oy: text(d, (640, 420 + oy/SS), "toutou-gourmet.com", MED(34), MUTED, anchor="mm"))
    p = prog(t, 1.0, 0.8)
    if p > 0: fr.d.rounded_rectangle(S(640 - 200 * p, 452, 640 + 200 * p, 458), radius=3 * SS, fill=ORANGE)
    return fr.out()

def cards(fr, t, items, y0, y1, starts):
    n = len(items); gap = 30; cw = (1280 - 2 * 110 - gap * (n - 1)) / n
    for k, (col, a, b) in enumerate(items):
        x = 110 + k * (cw + gap)
        def fn(d, ox, oy, x=x, col=col, a=a, b=b):
            rrect(d, (x, y0 + oy/SS, x + cw, y1 + oy/SS), col, 22)
            text(d, (x + 28, y0 + 30 + oy/SS), a, BOLD(30))
            for li, line in enumerate(b.split("\n")):
                text(d, (x + 28, y0 + 90 + li * 52 + oy/SS), line, DISP(46) if len(b) < 14 else MED(28))
        fr.layer(prog(t, starts[k], 0.55), fn, dy=60)

def sc_prix3(t, T):
    fr = Frame(); s = T * 0.18
    fr.layer(prog(t, 0.1), lambda d, ox, oy: text(d, (110, 110 + oy/SS), "Budget mensuel · chien de 10 kg", DISP(48)))
    cards(fr, t, [(BLEU, "Standard", "10-15 €"), (AMBRE, "Premium", "25-40 €"), (VERT, "Repas frais", "60-80 €")], 230, 470, [0.5, 0.5 + s, 0.5 + 2 * s])
    return fr.out()

def bars(fr, t, title, rows, vmax, starts, foot=None):
    fr.layer(prog(t, 0.1), lambda d, ox, oy: text(d, (110, 130 + oy/SS), title, DISP(54)))
    for k, (lab, val, valtxt, col) in enumerate(rows):
        y = 260 + k * 110; p = prog(t, starts[k], 1.1)
        fr.layer(prog(t, starts[k] - 0.2, 0.4), lambda d, ox, oy, y=y, lab=lab: text(d, (110, y + 20), lab, MED(36)), dy=0, dx=-30)
        if p > 0:
            wmax = 640; w = max(24, wmax * val / vmax * p)
            fr.d.rounded_rectangle(S(400, y + 8, 400 + w, y + 64), radius=28 * SS, fill=col, outline=INK, width=3 * SS)
            fr.layer(min(1, p * 1.5), lambda d, ox, oy, y=y, w=w, v=valtxt: text(d, (400 + w + 24, y + 20), v, BOLD(36)), dy=0)
    if foot: fr.layer(prog(t, starts[-1] + 1.2), lambda d, ox, oy: text(d, (110, 260 + len(rows) * 110 + 20 + oy/SS), foot, MED(32), MUTED))

def sc_digest(t, T):
    fr = Frame(); s = min(1.6, T * 0.12)
    bars(fr, t, "Digestibilité", [("Repas frais", 92, "85-92 %", VERT), ("Premium", 80, "75-80 %", AMBRE), ("Standard", 70, "60-70 %", ROSE)], 100, [0.6, 0.6 + s, 0.6 + 2 * s])
    return fr.out()

def sc_prix(t, T):
    fr = Frame(); s = min(1.6, T * 0.12)
    bars(fr, t, "Chien de 15 kg · coût par an", [("Repas frais", 780, "660-780 €", VERT), ("Premium", 420, "336-420 €", AMBRE)], 780, [0.6, 0.6 + s], "Écart : environ 300 à 400 € par an")
    return fr.out()

def sc_eau(t, T):
    fr = Frame()
    fr.layer(prog(t, 0.1), lambda d, ox, oy: text(d, (640, 110 + oy/SS), "Humidité de la gamelle", DISP(54), anchor="mm"))
    for k, (x, lab, val, txt, col, t0) in enumerate([(380, "Croquettes", 0.10, "8-12 %", AMBRE, 0.6), (900, "Repas frais", 0.75, "70-80 %", BLEU, 0.6 + min(1.8, T * 0.15))]):
        def glass(d, ox, oy, x=x, lab=lab): rrect(d, (x - 110, 190 + oy/SS, x + 110, 560 + oy/SS), WHITE, 26); text(d, (x, 610 + oy/SS), lab, MED(34), anchor="mm")
        fr.layer(prog(t, t0 - 0.4, 0.4), glass)
        p = prog(t, t0, 1.4)
        if p > 0:
            h = 366 * val * p
            fr.d.rounded_rectangle(S(x - 108, 558 - h, x + 108, 558), radius=24 * SS, fill=col)
            fr.d.rounded_rectangle(S(x - 110, 190, x + 110, 560), radius=26 * SS, outline=INK, width=3 * SS)
            fr.layer(min(1, p * 1.4), lambda d, ox, oy, x=x, txt=txt, h=h: text(d, (x, min(520, 540 - h) - 40), txt, BOLD(40), anchor="mm"), dy=0)
    return fr.out()

def sc_etiquette(t, T):
    fr = Frame()
    fr.layer(prog(t, 0.1), lambda d, ox, oy: text(d, (140, 120 + oy/SS), "Lis le premier ingrédient", DISP(54)))
    lines = ["Composition :", "Poulet frais 45 %, patate douce,", "pois, graisse de poulet, huile", "de saumon, tocophérols…"]
    def card(d, ox, oy):
        rrect(d, (140, 210 + oy/SS, 1140, 580 + oy/SS), WHITE, 18)
    fr.layer(prog(t, 0.4, 0.6), card)
    p = prog(t, 1.4, 0.9)
    if p > 0:
        x0 = 186; wfull = fr.d.textlength("Poulet frais 45 %", font=MED(42)) / SS
        fr.d.rounded_rectangle(S(x0 - 8, 318, x0 + 20 + wfull * p, 372), radius=8 * SS, fill=VERT)
    if t > 0.7:
        for i, l in enumerate(lines):
            fr.layer(prog(t, 0.7 + i * 0.12, 0.4), lambda d, ox, oy, i=i, l=l: text(d, (186, 250 + i * 70 + oy/SS), l, BOLD(42) if i == 0 else MED(42)), dy=15)
    s = back((t - 2.5) / 0.5)
    if s > 0:
        c = (1040, 340); k = 34 * s
        fr.d.line(S(c[0] - k, c[1], c[0] - k / 3, c[1] + k * 0.7, c[0] + k, c[1] - k * 0.8), fill=(30, 140, 80), width=int(12 * SS), joint="curve")
    return fr.out()

def sc_profils(t, T):
    fr = Frame(); s = T * 0.2
    fr.layer(prog(t, 0.1), lambda d, ox, oy: text(d, (110, 110 + oy/SS), "Quelle gamelle pour quel chien ?", DISP(48)))
    cards(fr, t, [(VERT, "Repas frais", "chien qui chipote\ndigestion fragile"), (AMBRE, "Premium", "chien en forme\nbudget maîtrisé"), (BLEU, "Mix 50/50", "frais le soir\ncroquettes le matin")], 220, 480, [0.5, 0.5 + s, 0.5 + 2 * s])
    return fr.out()

def sc_transition(t, T):
    fr = Frame(); s = min(1.5, T * 0.15)
    fr.layer(prog(t, 0.1), lambda d, ox, oy: text(d, (110, 120 + oy/SS), "Transition sur 10 jours", DISP(54)))
    steps = [("J1-3", 0.25), ("J4-6", 0.5), ("J7-9", 0.75), ("J10", 1.0)]
    for k, (lab, v) in enumerate(steps):
        x = 110 + k * 270; t0 = 0.6 + k * s
        fr.layer(prog(t, t0 - 0.3, 0.4), lambda d, ox, oy, x=x: rrect(d, (x, 230 + oy/SS, x + 240, 560 + oy/SS), WHITE, 18))
        p = prog(t, t0, 0.9)
        if p > 0:
            h = 326 * v * p
            fr.d.rounded_rectangle(S(x + 2, 558 - h, x + 238, 558), radius=16 * SS, fill=VERT)
            fr.d.rounded_rectangle(S(x, 230, x + 240, 560), radius=18 * SS, outline=INK, width=3 * SS)
            text(fr.d, (x + 120, 290), lab, BOLD(34), anchor="mm"); text(fr.d, (x + 120, 360), f"{int(v * 100 * p)} %", DISP(52), anchor="mm")
    fr.layer(prog(t, 0.6 + 4 * s), lambda d, ox, oy: text(d, (110, 620 + oy/SS), "part du nouvel aliment dans la gamelle", MED(30), MUTED))
    return fr.out()

def sc_marques(t, T):
    fr = Frame(); s = T * 0.13
    items = [(VERT, "Elmut", "France · chiens et chats"), (ROSE, "Dog Chef", "personnalisation poussée"), (AMBRE, "Franklin", "une seule protéine animale"), (BLEU, "Ultra Premium Direct", "vente directe")]
    for k, (col, a, b) in enumerate(items):
        x = 110 + (k % 2) * 540; y = 60 + (k // 2) * 250
        def fn(d, ox, oy, x=x, y=y, col=col, a=a, b=b):
            rrect(d, (x, y + oy/SS, x + 510, y + 220 + oy/SS), col, 24)
            text(d, (x + 36, y + 50 + oy/SS), a, DISP(48)); text(d, (x + 36, y + 135 + oy/SS), b, MED(30))
        fr.layer(prog(t, 0.3 + k * s, 0.55), fn, dy=50)
    return fr.out()

def sc_recap(t, T):
    fr = Frame(); s = T * 0.2
    fr.layer(prog(t, 0.1), lambda d, ox, oy: text(d, (110, 120 + oy/SS), "En résumé", DISP(58)))
    items = [(VERT, "Frais : mieux digéré, plus d'eau"), (ROSE, "Frais : 2 à 3 fois plus cher"), (AMBRE, "Premium : suffit à un chien en forme"), (BLEU, "Mix 50/50 : un bon compromis")]
    for k, (col, l) in enumerate(items):
        y = 230 + k * 100
        def fn(d, ox, oy, y=y, col=col, l=l):
            d.ellipse(S(110 + ox/SS, y + 8, 150 + ox/SS, y + 48), fill=col, outline=INK, width=3 * SS); text(d, (180 + ox/SS, y + 4), l, MED(40))
        fr.layer(prog(t, 0.5 + k * s, 0.5), fn, dy=0, dx=-60)
    return fr.out()

def sc_text(big, bg=AMBRE):
    def f(t, T):
        fr = Frame(bg); words = big.split(); lines = []; cur = ""
        for w in words:
            if fr.d.textlength((cur + " " + w).strip(), font=DISP(96)) / SS > 1000: lines.append(cur); cur = w
            else: cur = (cur + " " + w).strip()
        lines.append(cur); y0 = 360 - (len(lines) - 1) * 58
        for i, l in enumerate(lines):
            fr.layer(prog(t, 0.15 + i * 0.18, 0.6), lambda d, ox, oy, i=i, l=l: text(d, (640, y0 + i * 116 + oy/SS), l, DISP(96), anchor="mm"), dy=50)
        p = prog(t, 0.6 + len(lines) * 0.18, 0.7)
        if p > 0: w = fr.d.textlength(lines[-1], font=DISP(96)) / SS; fr.d.rounded_rectangle(S(640 - w / 2 * p, y0 + (len(lines) - 1) * 116 + 64, 640 + w / 2 * p, y0 + (len(lines) - 1) * 116 + 74), radius=5 * SS, fill=ORANGE)
        return fr.out()
    return f

SCENES = {"versus": sc_versus, "logo": sc_logo, "prix3": sc_prix3, "digest": sc_digest, "eau": sc_eau, "etiquette": sc_etiquette,
          "prix": sc_prix, "profils": sc_profils, "transition": sc_transition, "marques": sc_marques, "recap": sc_recap}

def render(scene, secs, out, enc, fade):
    n = max(1, round(secs * FPS))
    p = subprocess.Popen(["ffmpeg","-y","-loglevel","error","-f","rawvideo","-pix_fmt","rgb24","-s",f"{OUT[0]}x{OUT[1]}","-r",str(FPS),"-i","-","-vf",fade,*enc,out], stdin=subprocess.PIPE)
    last = None; frozen = None
    for i in range(n):
        t = i / FPS
        if frozen is None:
            im = scene(t, secs); b = im.tobytes()
            if t > 6 and b == last: frozen = b   # animation terminée : on fige
            last = b
        p.stdin.write(frozen or last)
    p.stdin.close()
    if p.wait(): raise RuntimeError(out)
