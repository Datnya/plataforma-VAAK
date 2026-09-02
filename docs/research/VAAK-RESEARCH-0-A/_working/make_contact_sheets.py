from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(r"C:\Users\HP\OneDrive\Desktop\Plataforma VAAK\docs\research\VAAK-RESEARCH-0-A\_working")
PAGES = ROOT / "page-images"
OUT = ROOT / "contact-sheets"
OUT.mkdir(parents=True, exist_ok=True)

font = ImageFont.load_default(size=24)
for folder in sorted(p for p in PAGES.iterdir() if p.is_dir()):
    images = [Image.open(path).convert("RGB") for path in sorted(folder.glob("page-*.png"))]
    width = max(image.width for image in images)
    label_height = 38
    rows = (len(images) + 1) // 2
    row_heights = []
    for row in range(rows):
        row_images = images[row * 2 : row * 2 + 2]
        row_heights.append(max(image.height for image in row_images) + label_height)
    sheet = Image.new("RGB", (width * 2 + 30, sum(row_heights) + 20), "#d8d8d8")
    draw = ImageDraw.Draw(sheet)
    y = 10
    for index, image in enumerate(images):
        row = index // 2
        col = index % 2
        if col == 0 and row > 0:
            y = 10 + sum(row_heights[:row])
        x = 10 + col * (width + 10)
        draw.text((x, y), f"{folder.name} / page {index + 1}", fill="black", font=font)
        sheet.paste(image, (x, y + label_height))
    sheet.save(OUT / f"{folder.name}.png", optimize=True)
    for image in images:
        image.close()
    print(OUT / f"{folder.name}.png")
