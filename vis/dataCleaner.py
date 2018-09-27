import json

bad_words = ['com', 'enron', 'http', 'www', 'mail']

def cell_sort_key(word):
	return word[1]

def clean(filename):
	with open(filename, 'r') as f:
		data = json.load(f)

		words = data['wordgrid']['words']
		words_clean = []

		for cell in words:
			cell_clean = [word for word in cell if word[0].lower() not in bad_words]
			cell_clean.sort(reverse=True, key=cell_sort_key)
			print(cell_clean)
			words_clean.append(cell_clean)

		print(words_clean)

		data['wordgrid']['words'] = words_clean

		with open(filename + '.clean.json', 'w') as outfile:
			json.dump(data, outfile)

if __name__ == '__main__':
	clean('data/data_15.json.res.web.json')
