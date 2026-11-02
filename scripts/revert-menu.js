const mysql = require("mysql2/promise");

async function main() {
  const connection = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3308,
    user: "root",
    password: "",
    database: "ecommerce",
    charset: "utf8mb4",
  });

  console.log("Connected to MySQL database.");

  // 1. Revert Categories Menu to previous state
  const prevCategoryMenus = [
    { label: "Zebra Blinds", url: "/category/zebra-blinds", parent_id: null, sort_order: 1 },
    { label: "Roller Blinds", url: "/category/roller-blinds", parent_id: null, sort_order: 2 },
    { label: "Vertical Blinds", url: "/category/vertical-blinds", parent_id: null, sort_order: 3 },
    { label: "Roman Blinds", url: "/category/roman-blinds", parent_id: null, sort_order: 4 },
    { label: "Motorized Blinds", url: "/category/motorized-blinds", parent_id: null, sort_order: 5 },
    { label: "Motorized Curtain Tracks", url: "/category/motorized-curtain-tracks", parent_id: 37, sort_order: 6 },
    { label: "Window Blinds", url: "/category/window-blinds", parent_id: null, sort_order: 7 },
  ];

  await connection.query("DELETE FROM nav_menu_items WHERE menu_location = 'categories'");
  for (const m of prevCategoryMenus) {
    await connection.query(
      "INSERT INTO nav_menu_items (label, url, target, parent_id, menu_location, sort_order, is_active) VALUES (?, ?, '_self', ?, 'categories', ?, 1)",
      [m.label, m.url, m.parent_id, m.sort_order]
    );
  }
  console.log("Reverted category menus.");

  // 2. Revert Header Menu to previous state
  const prevHeaderMenus = [
    { label: "Home", url: "/", parent_id: null, sort_order: 1 },
    { label: "Shop", url: "/shop", parent_id: null, sort_order: 2 },
    { label: "Careers", url: "/careers", parent_id: null, sort_order: 4 },
    { label: "About Us", url: "/about", parent_id: null, sort_order: 5 },
    { label: "Journal", url: "/blog", parent_id: null, sort_order: 6 },
    { label: "Contact", url: "/contact", parent_id: null, sort_order: 7 },
  ];

  await connection.query("DELETE FROM nav_menu_items WHERE menu_location = 'header'");
  for (const m of prevHeaderMenus) {
    await connection.query(
      "INSERT INTO nav_menu_items (label, url, target, parent_id, menu_location, sort_order, is_active) VALUES (?, ?, '_self', ?, 'header', ?, 1)",
      [m.label, m.url, m.parent_id, m.sort_order]
    );
  }
  console.log("Reverted header menus.");

  const [allMenus] = await connection.query("SELECT id, label, url, menu_location, sort_order FROM nav_menu_items ORDER BY menu_location, sort_order");
  console.log("Current nav_menu_items:", allMenus);

  await connection.end();
}

main().catch((err) => {
  console.error("Error reverting menus:", err);
  process.exit(1);
});

