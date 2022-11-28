import os

logs = open("code.txt", "w")

for (root, dirs, files) in os.walk("."):
    print(root, dirs, files)
    for filename in files:
        if (os.path.splitext(filename)[1] not in [".ico", ".png"]) and (filename not in ["package-lock.json", "code.txt", "main.py"]):
            filepath = os.path.join(root, filename)
            logs.write("*************************************************************\n")
            logs.write(f"File Name: {filepath} \n")
            logs.write("*************************************************************\n\n")

            file1 = open(filepath)
            
            for line in file1.readlines():
                logs.write(line)
            file1.close()

            logs.write("\n\n\n")

logs.close()