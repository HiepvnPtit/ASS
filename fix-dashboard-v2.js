const fs = require("fs");
const path = "O:\\nestjs-boilerplate-main\\nestjs-boilerplate-main\\src\\admin\\admin.service.ts";
let content = fs.readFileSync(path, "utf8");

// Fix 1: "};async" -> split into two parts
content = content.replace("};async", "};\n\n  async");

// Fix 2: "  }async" -> split with new method
content = content.replace("  }async getDashboardMetrics() {", "  }\n\n  async getDashboardMetrics() {");

// Now there should be duplicate getDashboardMetrics methods. Remove the first (old) one.
// Find the complete old method and remove it.
const lines = content.split("\n");
let result = [];
let skipBlock = false;
let foundFirst = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes("async getDashboardMetrics()")) {
    if (!foundFirst) {
      foundFirst = true;
      // Skip the old method - start skipping
      skipBlock = true;
      continue;
    } else {
      // Second occurrence - this is the NEW method, keep it
      skipBlock = false;
      result.push(line);
      continue;
    }
  }
  
  if (skipBlock) {
    // Check if we have exited the method by finding the next method or closing
    if (line.trim().startsWith("async ") || line.trim().startsWith("}")) {
      if (line.trim() === "}" || line.trim().startsWith("} //") || line.trim() === "}") {
        // Check if next line is another method or end of class
        const nextLine = lines[i+1]?.trim() || "";
        if (nextLine.startsWith("async ") || nextLine.startsWith("}") || nextLine === "" || i === lines.length - 1) {
          skipBlock = false;
          if (!nextLine.startsWith("async")) {
            // Don't add the closing brace of the old method if next is a new method
          }
          continue;
        }
      }
      continue;
    }
    // Keep the line if not in skip mode
  }
  
  result.push(line);
}

content = result.join("\n");

// Fix: remove any remaining duplicate or empty lines
content = content.replace(/\n{3,}/g, "\n\n");

fs.writeFileSync(path, content, "utf8");
console.log("Fixed");
