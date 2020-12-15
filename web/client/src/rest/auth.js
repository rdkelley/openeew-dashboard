class Auth {
  login() {
    return () => {
      fetch('/login', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'rdkelley@gmail.com',
          password: 'India2618789#',
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Success:', data)
        })
        .catch((error) => {
          console.error('Error:', error)
        })
    }
  }

  isAuth() {
    return () => {
      fetch('/isLoggedIn', {
        credentials: 'include',
      })
        .then((response) => response.json())
        .then((data) => {
          console.log('Success:', data)
        })
        .catch((error) => {
          console.error('Error:', error)
        })
    }
  }
}

const AuthClient = new Auth()

export default AuthClient
