import os
import cv2
import json
import psycopg2
import mediapipe as mp

# Configs
IMAGE_FOLDER = 'C:/Users/soura/Downloads/gg/assets'
DB_CONFIG = {
    'host': 'localhost',
    'dbname': 'fitness',
    'user': 'postgres',
    'password': '1234',
    'port': 5432
}

# Setup MediaPipe Pose
mp_pose = mp.solutions.pose
pose = mp_pose.Pose(static_image_mode=True)

# Connect to PostgreSQL
conn = psycopg2.connect(**DB_CONFIG)
cursor = conn.cursor()

# Create table if not exists
cursor.execute('''
    CREATE TABLE IF NOT EXISTS assets (
        id SERIAL PRIMARY KEY,
        name TEXT,
        coordinates JSONB,
        image BYTEA,
        level TEXT DEFAULT 'beginner'
    );
''')
conn.commit()

# Process each image
for filename in os.listdir(IMAGE_FOLDER):
    if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
        filepath = os.path.join(IMAGE_FOLDER, filename)
        image = cv2.imread(filepath)
        if image is None:
            continue

        # Run MediaPipe Pose
        results = pose.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
        if not results.pose_landmarks:
            continue

        # Extract keypoints as list of dicts
        coords = [
            {'x': lm.x, 'y': lm.y, 'z': lm.z, 'visibility': lm.visibility}
            for lm in results.pose_landmarks.landmark
        ]

        # Read image as binary
        with open(filepath, 'rb') as f:
            img_binary = f.read()

        # Insert into DB
        cursor.execute(
            "INSERT INTO assets (name, coordinates, image, level) VALUES (%s, %s, %s, %s)",
            (filename, json.dumps(coords), psycopg2.Binary(img_binary), 'beginner')
        )
        print(f"Inserted {filename}")

# Cleanup
conn.commit()
cursor.close()
conn.close()
pose.close()
