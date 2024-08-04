from rest_framework.exceptions import APIException

class InvalidData(APIException):
    status_code = 400
    default_detail = 'The request body did not pass validation.'
    default_code = 'invalid_data'