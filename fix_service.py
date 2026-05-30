import sys
sys.stdout.reconfigure(encoding="utf-8")
path = "O:/nestjs-boilerplate-main/nestjs-boilerplate-main/src/trips/trips.service.ts"
with open(path, "rb") as f:
    data = f.read()
text = data.decode("utf-8")
lines = text.split("\n")
fixed = []
for line in lines:
    l = line
    if "\u00c3" in l or "\u00c2" in l:
        try:
            s1 = l.encode("windows-1252", errors="replace").decode("utf-8", errors="replace")
            s2 = s1.encode("windows-1252", errors="replace").decode("utf-8", errors="replace")
            if "\u00c3" not in s2 and "\u00c2" not in s2:
                l = s2
            elif "\u00c3" not in s1 and "\u00c2" not in s1:
                l = s1
        except:
            pass
    fixed.append(l)
result = "\n".join(fixed)
with open(path, "w", encoding="utf-8") as f:
    f.write(result)
print("Done!")
