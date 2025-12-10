from PIL import Image, ImageDraw

# SETTINGS
INPUT_IMAGE = "torah.png"       # put your image file here
OUTPUT_GIF = "torah.gif"
BAR_HEIGHT = 20                 # height of the loader bar
BAR_MARGIN = 10                 # space between image and bar
FRAMES = 20                     # number of frames in the gif
DURATION = 50                   # ms per frame

# Open original image
base = Image.open(INPUT_IMAGE).convert("RGB")
w, h = base.size

# Total height: image + margin + bar
total_h = h + BAR_MARGIN + BAR_HEIGHT

frames = []

for i in range(FRAMES):
    # Create blank frame
    frame = Image.new("RGB", (w, total_h), "white")
    draw = ImageDraw.Draw(frame)

    # Paste original image
    frame.paste(base, (0, 0))

    # Bar background
    bar_top = h + BAR_MARGIN
    bar_bottom = bar_top + BAR_HEIGHT
    draw.rectangle([0, bar_top, w, bar_bottom], fill="#e0e0e0")

    # Moving loader part
    loader_width = int(w * 0.3)  # 30 percent of width
    # Position moves across width
    t = i / FRAMES
    x_start = int((w + loader_width) * t) - loader_width
    x_end = x_start + loader_width

    # Clip to bar region
    x_start_clamped = max(0, x_start)
    x_end_clamped = min(w, x_end)
    if x_start_clamped < x_end_clamped:
        draw.rectangle(
            [x_start_clamped, bar_top, x_end_clamped, bar_bottom],
            fill="#3498db"
        )

    frames.append(frame)

# Save as animated GIF
frames[0].save(
    OUTPUT_GIF,
    save_all=True,
    append_images=frames[1:],
    duration=DURATION,
    loop=0,
)

print("Saved", OUTPUT_GIF)
