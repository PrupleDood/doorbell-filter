# import requirements needed
from flask import Flask, render_template, request, jsonify
from utils import get_base_url
import json

# from inference import get_prediction

# setup the webserver
# port may need to be changed if there are multiple flask servers running on same server
port = 12345
base_url = get_base_url(port)

# if the base url is not empty, then the server is running in development, and we need to specify the static folder so that the static files are served
if base_url == '/':
  app = Flask(__name__)
else:
  app = Flask(__name__, static_url_path=base_url + 'static')


# set up the routes and logic for the webserver
@app.route(f'{base_url}')
def home():
  # get_prediction('people.png')
  
  return render_template('index.html')


# define additional routes here
# for example:
# @app.route(f'{base_url}/team_members')
# def team_members():
#     return render_template('team_members.html') # would need to actually make this page


#post option
# @app.route(f'{base_url}', methods=['POST'])
# def upload_file():
#   pass

with open('static/data.json', 'r') as json_file:
    initial_data = json.load(json_file)

@app.route('/static/update_json', methods=['POST'])
def update_json():
    try:
        # Get the modified JSON data from the request
        modified_data = request.get_json()

        # Update the initial data with the modified data
        initial_data.update(modified_data)

        # Write the updated data back to the file
        with open('static/data.json', 'w') as json_file:
            json.dump(initial_data, json_file, indent=4)

        return jsonify({'message': 'JSON file updated successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# print(get_prediction('people.png'))
# print(get_prediction('nick.png'))

if __name__ == '__main__':
  # IMPORTANT: change url to the site where you are editing this file.
  website_url = 'url'

  print(f'Try to open\n\n    https://{website_url}' + base_url + '\n\n')
  app.run(host='0.0.0.0', port=port, debug=True)
