import os, sys, base64, concurrent.futures as cf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen import call, D
def tr(f):
    b = base64.b64encode(open(f"{D}/vo/{f}","rb").read()).decode()
    r = call("gemini-2.5-flash", {"contents":[{"parts":[{"inlineData":{"mimeType":"audio/mpeg","data":b}},{"text":"Transcris mot à mot ce que dit la voix, en français, sans corriger. Écris les chiffres et lettres épelées exactement comme prononcés."}]}]})
    return f, r["candidates"][0]["content"]["parts"][0]["text"]
if __name__ == "__main__":
 with cf.ThreadPoolExecutor(4) as ex:
    for f,t in ex.map(tr, ["07-mythes.mp3","10-marques.mp3","11-outro.mp3","02-intro.mp3"]): print("==",f,"\n",t)
