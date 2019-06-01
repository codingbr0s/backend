#credit goes to https://www.pyimagesearch.com/2014/09/01/build-kick-ass-mobile-document-scanner-just-5-minutes/

from imutils.perspective import four_point_transform
from imutils.encodings import base64_decode_array, base64_encode_array
from imutils.convenience import grab_contours
import numpy as np
import cv2
import imutils
import base64
import time

def downscale_image(im, max_dim=512):
	"""Shrink im until its longest dimension is <= max_dim.
	Returns new_image, scale (where scale <= 1).
	"""

	vals = im.shape
	a = vals[0]
	b = vals[1]
	if max(a, b) <= max_dim:
		return 1.0, im

	scale = 1.0 * max_dim / max(a, b)
	new_im = imutils.resize(im,(int(a * scale)),(int(b * scale)))
	return scale, new_im

def convertImage(b64string):
	print("Warping image")
	nparr = base64_decode_array(b64string, np.uint8)
	image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

	ratio = image.shape[0] / 500.0
	orig = image.copy()
	image = imutils.resize(image, height = 500)

	gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
	gray = cv2.GaussianBlur(gray, (5, 5), 0)
	edged = cv2.Canny(gray, 75, 200)

	shape = image.shape
	cv2.line(edged, (1, 0), (shape[1] - 2, 0), (255, 255, 255))
	cv2.line(edged, (1, shape[0] - 1), (shape[1] - 2, shape[0] - 1), (255, 255, 255))
	cnts = cv2.findContours(edged.copy(), cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
	cnts = grab_contours(cnts)
	cnts = sorted(cnts, key = cv2.contourArea, reverse = True)[:5]

	cv2.imshow("Test", image)
	cv2.imshow("edged", edged)
	cv2.waitKey(0)
	cv2.destroyAllWindows()

	maxperi = 0
	screenCnt = []
	
	for c in cnts:
		peri = cv2.arcLength(c, True)
		approx = cv2.approxPolyDP(c, 0.02 * peri, True)
		if len(approx) == 4 and maxperi < peri:
			print(c)
			screenCnt = approx
			maxperi = peri

	if len(screenCnt) != 0:
		print("Found screen contour")

		warped = four_point_transform(orig, screenCnt.reshape(4, 2) * ratio)
		warped = cv2.cvtColor(warped, cv2.COLOR_BGR2GRAY)
		retval, warped = cv2.threshold(warped, 140, 255, cv2.THRESH_BINARY)
		
		scale, warped = downscale_image(warped)
		print("Resized image with %f scale" % scale)
		retval, buf = cv2.imencode('.jpg', warped)

		cv2.imshow("Test", warped);
		cv2.waitKey(0)

		cv2.imwrite("test.jpg", warped)
		
		return True, base64_encode_array(buf)
	else:
		print("No contour found, is the image alreay in top down view?")
		scale, orig = downscale_image(orig)
		print("Resized image with %f scale" % scale)
		retval, buf = cv2.imencode('.jpg', orig)

		cv2.imwrite("test.jpg", orig)

		return False, base64_encode_array(buf)

	
with open('Arzt2.jpg', 'rb') as fh:
	retval, b64string = convertImage(base64.b64encode(fh.read()))

