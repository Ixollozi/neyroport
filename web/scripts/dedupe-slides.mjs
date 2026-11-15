import fs from "fs";
import path from "path";

const dir = "src/content/origin";
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
  const data = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"));
  let dropped = 0;
  for (const key of ["d", "m"]) {
    const secs = data[key].secs;
    const drop = new Set();
    const groups = new Map();
    secs.forEach((s, i) => {
      const k = `${Math.round(s.top / 2) * 2}:${Math.round(s.h / 8) * 8}`;
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(i);
    });
    for (const idxs of groups.values()) {
      if (idxs.length < 3) continue;
      const keep =
        idxs.find((i) =>
          secs[i].nodes.some((n) => (n.html || "").replace(/<[^>]+>/g, "").trim().length > 15),
        ) ?? idxs[0];
      for (const i of idxs) if (i !== keep) drop.add(i);
    }
    data[key].secs = secs.filter((_, i) => !drop.has(i));
    dropped += drop.size;
  }
  fs.writeFileSync(path.join(dir, file), JSON.stringify(data));
  if (dropped) console.log(file, "dropped", dropped);
}
console.log("done");
