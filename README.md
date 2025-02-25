# Cloudflare Temp Email

## Send email with the api

Python:

```python
import requests
api_url = "https://temp-email-api.yacker.one/api/send_mail"
# use the mail account credentials as the api key
api_key = "eyJhbGc...1oV0"

def send_email(from_name, to_name, to_mail, subject, content):
    send_body = {
        "from_name": from_name,
        "to_name": to_name,
        "to_mail": to_mail,
        "subject": subject,
        "is_html": False,
        "content": "Testing",
      }
    res = requests.post(
        api_url,
        json=send_body, headers={
            "Authorization": f"Bearer {api_key}",
            # "x-custom-auth": "<token>",
            "Content-Type": "application/json"
        }
    )
    # print(res.text)
    return res.text

send_email("MyName", "YourName", "your_email@gmail.com", "Subject", "Content")
```

Javascript:

```javascript
const api_url = "https://temp-email-api.yacker.one/api/send_mail"
const api_key = "eyJhbGc...1oV0"

async function send_email(from_name, to_name, to_mail, subject, content) {
    const response = await fetch(api_url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${api_key}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "from_name": from_name,
            "to_name": to_name,
            "to_mail": to_mail,
            "subject": subject,
            "is_html": false,
            "content": content
        })
    })
    const data = await response.json()
    // console.log(data)
    return data
}

send_email("MyName", "YourName", "your_email@gmail.com", "Subject", "Content")
```
