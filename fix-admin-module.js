const fs = require("fs");
let content = fs.readFileSync("O:\\nestjs-boilerplate-main\\nestjs-boilerplate-main\\src\\admin\\admin.module.ts", "utf8");

// Add imports
content = content.replace(
  "import { ChuyenDi } from '../entities/chuyen-di.entity';",
  "import { ChuyenDi } from '../entities/chuyen-di.entity';\nimport { ThanhToan } from '../entities/thanh-toan.entity';\nimport { DanhGia } from '../entities/danh-gia.entity';"
);

// Add to forFeature
content = content.replace(
  "      ChuyenDi,\n    ]),",
  "      ChuyenDi,\n      ThanhToan,\n      DanhGia,\n    ]),"
);

fs.writeFileSync("O:\\nestjs-boilerplate-main\\nestjs-boilerplate-main\\src\\admin\\admin.module.ts", content, "utf8");
console.log("Admin module updated");
