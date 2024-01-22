# Inventory Management Web Application

This web application is built using Django for the backend and React.js for the front-end. It serves as a comprehensive inventory and asset-management tool, allowing users to define assets, locations, shipments, and events. The application is designed to streamline the tracking and management of assets within a specified environment.

## Features

### 1. Asset Management
- Define various types of assets.
- Mark assets as 'container' to allow storage of other assets inside them.

### 2. Location Management
- Create and manage different locations for organizing assets.

### 3. Shipment Tracking
- Track shipments with 'origin' and 'destination' properties.
- Associate shipments with specific locations.
- Link shipments to different assets.

### 4. Event Logging
- Record events related to assets, locations, and shipments.

## Getting Started

Follow these steps to set up and run the web application locally.

### Prerequisites
- Python 3.11.4+
   - pip 23.2.1+
   - venv (`pip install venv`)
- Node.js v18.16.1+

### Installation

#### Backend (Django)
1. Navigate to the `root` project directory.
2. Create a new virtual environment `py -m venv .venv`. (If you do not have venv installed, you can install it by running `pip install venv`)
2. Activate your virtual environment `.venv/Scripts/Activate`.
3. Install Python dependencies `pip install -r requirements.txt`.
4. Start the Django development server: `python manage.py runserver`.

#### Frontend (React.js)
1. Navigate to the `main` directory within the projects root directory.
2. Install Node.js dependencies using `npm install --legacy-peer-deps`.
3. Start the React development server: `npm run dev`.

## Usage

Visit `http://127.0.0.1:8000` in your browser to access the web application.

## Contributing

Feel free to contribute to the development of this web application.

## License

This project is licensed under the [MIT License](LICENSE).
