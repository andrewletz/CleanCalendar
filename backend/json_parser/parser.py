import json

def main():
    with open('sample.json') as data_file:    
        data = json.load(data_file)
    print(data, "\n")
    print(data.keys(), "\n")
    print(data["glossary"]["title"])


if __name__ == "__main__":
    main()