import urllib.request
import json

def test_predict(img_path):
    with open(img_path, 'rb') as f:
        data = f.read()
    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    header = (
        f'--{boundary}\r\n'
        'Content-Disposition: form-data; name="file"; filename="test.png"\r\n'
        'Content-Type: image/png\r\n\r\n'
    ).encode('utf-8')
    footer = f'\r\n--{boundary}--\r\n'.encode('utf-8')
    body = header + data + footer

    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/predict',
        data=body,
        headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}
    )
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        print(img_path, '->', repr(res['recognized_text']), f'(conf: {res["confidence"]})')

if __name__ == '__main__':
    test_predict('d:/Downloads/SimpleHTR-master/crop_rabbit.png')
    test_predict('d:/Downloads/SimpleHTR-master/crop_red.png')
    test_predict('d:/Downloads/SimpleHTR-master/crop_multi.png')
