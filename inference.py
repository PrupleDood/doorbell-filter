import requests
import os
import base64

#using method from example from this morning

#using request is faster than using the roboflow package


def get_prediction(filename):
  url = "https://detect.roboflow.com/box-human/1"
  params = {"api_key": "jRinhpKBD8VqzVsPaiFp"}
  headers = {"Content-Type": "application/x-www-form-urlencoded"}

  with open(f'uploads/{filename}', 'rb') as image_file:
    image_base64 = image_file.read()
    image = base64.b64encode(image_base64).decode('utf-8')

  response = requests.post(url, params=params, data=image, headers=headers)

  if response.status_code != 200:
    print("API error occurred:", response.text)
    # flash('API error has occurred, wait a few seconds and try again...')
    # return redirect(url_for('home'))
    return

  result = response.json()
  print(result)

  is_resident = False

  predictions = result['predictions']
  if 'Human' in [prediction['class'] for prediction in predictions]:
    is_resident = get_resident(image)
    print(f'is resident {is_resident}')

  return (result, is_resident)


def get_resident(image):
  '''
  Makes request to resident vs unknown model\n
  If model finds a face with greater than 50% confidence\n
  it returns True else False 
  '''
  url = "https://detect.roboflow.com/resident-vs-unknown/1"
  params = {"api_key": "uBUrlJlKdU9xu1S4edpP"}
  headers = {"Content-Type": "application/x-www-form-urlencoded"}

  response = requests.post(url, params=params, data=image, headers=headers)

  if response.status_code != 200:
    print("API error occurred:", response.text)
    # flash('API error has occurred, wait a few seconds and try again...')
    # return redirect(url_for('home'))
    return

  result = response.json()['predictions']

  for prediction in result:
    if prediction['confidence'] > 0.5:
      return True

  return False


# def add_lines(filename, res):
#   '''
#   Used for adding bounding boxes to images\n
#   I tested this and found it faster than using the roblowflow module
#   '''
#   image_path = 'uploads/{}'
#   image = cv2.imread(image_path)

#   for pre in res:
#     x1, y1 = pre['x']-pre['width']//2, pre['y']-pre['height']//2
#     x2, y2 = pre['x']+pre['width']//2, pre['y']+pre['height']//2

#     color = (0, 255, 0)
#     thickness = 2

#     cv2.rectangle(image, (int(x1), int(y1)), (int(x2), int(y2)), color, thickness)

#   output_image_path = 'path_to_save_output_image.jpg'
#   cv2.imwrite(output_image_path, image)
