import os, sys, json, base64, time, urllib.request, concurrent.futures as cf
D = os.path.dirname(os.path.abspath(__file__)); K = os.environ["K"]; B = "https://generativelanguage.googleapis.com/v1beta"
def req(url, body=None):
    r = urllib.request.Request(url, data=json.dumps(body).encode() if body else None, headers={"x-goog-api-key": K, "Content-Type": "application/json"})
    return json.load(urllib.request.urlopen(r, timeout=300))
CLIPS = {
 "hook": "Slow gentle push-in. The dog blinks, tilts its head slightly and wags its tail softly. The hand-drawn confetti and sparkles gently twinkle and float. Calm, warm, natural daylight. No camera shake.",
 "croquettes": "Kibble keeps pouring in slow motion into the bowl, a few pieces bounce. The drawn confetti drift slightly. Static camera.",
 "eau": "The dog laps water from the fountain, water ripples and droplets sparkle in the light. The drawn droplets bob gently. Static camera, natural motion.",
 "mix": "Subtle steam rises from the fresh food bowl, the dog at the bottom looks from one bowl to the other. The drawn sun rays rotate slowly, the moon gently rocks. Static camera.",
 "outro": "The happy dog pants and wags, ears move, tiny head tilt toward the camera. Drawn confetti fall slowly over the scene, the party hat stays on the head. Static camera.",
}
def veo(name, prompt):
    out = f"{D}/veo/{name}.mp4"
    if os.path.exists(out): return name, "skip"
    img = base64.b64encode(open(f"{D}/out/img-{name}.jpg","rb").read()).decode()
    op = req(f"{B}/models/veo-3.1-fast-generate-preview:predictLongRunning", {"instances":[{"prompt": prompt + " Keep the exact same style, colours and hand-drawn overlay as the image. No text.", "image":{"bytesBase64Encoded": img, "mimeType":"image/jpeg"}}],
        "parameters":{"aspectRatio":"16:9","durationSeconds":6,"resolution":"720p"}})
    while not op.get("done"):
        time.sleep(10); op = req(f"{B}/{op['name']}")
    if "error" in op: return name, op["error"]
    uri = op["response"]["generateVideoResponse"]["generatedSamples"][0]["video"]["uri"]
    r = urllib.request.Request(uri, headers={"x-goog-api-key": K}); open(out,"wb").write(urllib.request.urlopen(r, timeout=300).read())
    return name, "ok"
def music():
    out = f"{D}/music/raw"
    r = req(f"{B}/models/lyria-3-clip-preview:generateContent", {"contents":[{"parts":[{"text":"Instrumental background music for a friendly French YouTube video about dog food. Light acoustic ukulele, soft hand claps and gentle glockenspiel, warm and cheerful but calm, steady tempo around 100 BPM, no vocals, loopable."}]}]})
    parts = r["candidates"][0]["content"]["parts"]
    for p in parts:
        if "inlineData" in p:
            open(out+"."+p["inlineData"]["mimeType"].split("/")[-1].split(";")[0],"wb").write(base64.b64decode(p["inlineData"]["data"])); return "music", p["inlineData"]["mimeType"]
    return "music", json.dumps(parts)[:300]
with cf.ThreadPoolExecutor(6) as ex:
    fs = [ex.submit(veo,n,p) for n,p in CLIPS.items()] + [ex.submit(music)]
    for f in cf.as_completed(fs):
        try: print(f.result(), flush=True)
        except Exception as e: print("ERR", e, getattr(e,'read',lambda:b'')()[:400])
