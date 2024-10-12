"""
Parse Folkets lexikon data folkets_sv_en_public.xml
(https://folkets-lexikon.csc.kth.se/folkets/om.html) entries and write to JSON file
"""
import urllib.request
import xml.etree.ElementTree as ET
import os.path
import json

PATH_TO_FILE = "folkets_sv_en_public.xml"

if not os.path.exists(PATH_TO_FILE):
    urllib.request.urlretrieve(
        "https://folkets-lexikon.csc.kth.se/folkets/folkets_sv_en_public.xml", PATH_TO_FILE)


tree = ET.parse(PATH_TO_FILE)
root = tree.getroot()
words = []

word_count = 0
for child in root:
    if child.tag == "word":
        swedish_word = child.attrib["value"].replace("|", "").strip()
        word_class = ""
        translations = []
        examples = []
        synonyms = []
        inflections = []
        if "class" in child.attrib:
            word_class = child.attrib["class"].strip()
            for sub_child in child:
                if sub_child.tag == "translation":
                    translation = sub_child.attrib["value"].strip().strip(
                        ",")
                    if translation:
                        translations.append(translation)
                if sub_child.tag == "synonym":
                    synonym = sub_child.attrib["value"].strip().strip(",")
                    if synonym:
                        synonyms.append(synonym)
                if sub_child.tag == "example":
                    example = sub_child.attrib["value"].strip()
                    if example:
                        for example_sub_child in sub_child:
                            if example_sub_child.tag == "translation":
                                translation = example_sub_child.attrib[
                                    "value"
                                ].strip()
                                if translations:
                                    example += " (" + translation + ")"
                                    examples.append(example)
                if sub_child.tag == "paradigm":
                    for paradigm_sub_child in sub_child:
                        if paradigm_sub_child.tag == "inflection":
                            inflection = (
                                paradigm_sub_child.attrib["value"]
                                .replace("|", "")
                                .strip()
                                .strip(",")
                            )
                            if inflection:
                                inflections.append(inflection)

            words.append({
                "word": swedish_word,
                "class": word_class,
                "translations": translations,
                "inflections": inflections,
                "examples": examples,
                "synonyms": synonyms
            })

            word_count += 1

with open("dictionary.json", "w") as f:
    json.dump(words, f)

print(f"Total words: {word_count}")
