import random
import string

def generate_password():
    upper = random.choice(string.ascii_uppercase)
    lower = random.choice(string.ascii_lowercase)
    digit = random.choice(string.digits)
    symbol = random.choice(string.punctuation)

    remaining = random.choices(
        string.ascii_letters + string.digits + string.punctuation,
        k=4
    )

    password_list = [upper, lower, digit, symbol] + remaining
    random.shuffle(password_list)

    return ''.join(password_list)


    print(generate_password())