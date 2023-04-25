import pickle
import sys
import json

# load the pre-trained model from the PKL file
with open('model.pkl', 'rb') as file:
    model = pickle.load(file)

# get the input data from the command-line argument
data = json.loads(sys.argv[1])

# run the prediction
prediction = model.predict(data)

# print the prediction to stdout (to be captured by Node.js)
print(prediction)
