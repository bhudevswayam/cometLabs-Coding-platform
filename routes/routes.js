// IMPORTING NECESSARY LIBRARIES AND MODULES

const express = require('express');
const router = new express.Router();
const User = require('../models/User')
const Question = require('../models/Question')
const Submission = require('../models/Submission')
const axios = require('axios')
axios.defaults.headers.post['Content-Type'] = 'application/json'
require('dotenv').config()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
let refreshTokens = []
// const  = process.env.
const TOKEN = '19b1dadad62eb0897d13bf04efa3bdb1'
const SUBMISSION_URL = 'https://76701661.problems.sphere-engine.com/api/v3/submissions'




router.get('/', authenticateToken, (req, res) => {
    // middleware to differentiate admins from participants.
    res.send(`You are ${req.user.role}, ${req.user.name}`)
})
// signup
router.post('/signup', async (req, res) => {
    // Adding post request for new user account
    const name = req.body.name
    const email = req.body.email
    const password = req.body.password
    const role = req.body.role

    // Creating new user
    const user = new User({
        name,
        email,
        password,
        role
    })

    // Saving the user to mongoDB
    await user.save().then(() => {
        // Generating tokens
        const accessToken = accessTokenGenerator(user)
        const refreshToken = refreshTokenGenerator(user)

        res.status(200).json({ email: user.email, accessToken: accessToken, refreshToken: refreshToken })
    }).catch(err => {
        res.status(400).send(err)
    })
})

// login
router.post('/login', async (req, res) => {
    // User details from POST request
    const email = req.body.email
    const password = req.body.password

    // Find user in database
    const user = await User.findOne({ email: email })   

    // Check if user exists
    if (!user) {
        return res.status(401).send('Please Sign Up, User Not Registered')
    } else {
        // Check if password is correct for user
        const isPasswordValid = await bcrypt.compare(password, user.password)

        // Check if password is valid
        if (!isPasswordValid) {
            return res.status(401).send('Invalid Password')
        } else {
            // Generate access token and refresh token
            const accessToken = accessTokenGenerator(user)
            const refreshToken = refreshTokenGenerator(user)

            // Send response
            res.send({ email: user.email, accessToken: accessToken, refreshToken: refreshToken })
        }
    }
})

// logout
router.post('/logout', (req, res) => {
    // Get refresh token from request and remove it from array
    refreshTokens = refreshTokens.filter(token => token !== req.body.refreshToken)
    res.send('Logged out')
})

// regenerate auth token with refresh token
router.post('/refresh', (req, res) => {
    const refreshToken = req.body.refreshToken

    // Checking if refresh token is valid
    if (refreshToken == null) {
        return res.status(401).send('Token is invalid')
    } else {
        if (!refreshTokens.includes(refreshToken)) {
            return res.status(403).send('Token is invalid')
        } else {
            jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN, (err, user) => {
                if (err) {
                    return res.status(403).send('Token is invalid')
                } else {
                    // Generate new access token
                    const accessToken = accessTokenGenerator(user)

                    return res.status(200).send({ accessToken: accessToken, refreshToken: refreshToken })
                }
            })

        }
    }
})

// display all questions
router.get('/display-questions', authenticateToken, async (req, res) => {
    // is user admin
    if (req.user.role == 'admin') {
        // get directly from sphere api
        await axios.get('https://76701661.problems.sphere-engine.com/api/v4/problems' + '?access_token=' + TOKEN).then(response => {
            res.send(response.data)
        }).catch(err => {
            res.status(400).send(err)
        })
    } else {
        res.send('You are not authorized')
    }
})

// display questions uploaded by any admin
router.get('/admin-uploaded-questions', authenticateToken, async (req, res) => {
    if (req.user.role == 'admin') {
        // get question ids from mongoDB and send them to sphere api
        let questionsList = []
        await Question.find().then(async (questions) => {
            for (let i = 0; i < questions.length; i++) {
                await axios.get('https://76701661.problems.sphere-engine.com/api/v4/problems' + '/' + questions[i].id + '?access_token=' + TOKEN).then(response => {
                    questionsList.push(response.data)
                }).catch(err => {
                    res.send(err)
                })
            }
        })
        if (questionsList.length > 0) {
            res.send(questionsList)
        } else {
            res.send('No questions uploaded')
        }
    } else {
        res.send('You are not authorized')
    }
})

// adding questions
router.post('/add-new-question', authenticateToken, async (req, res) => {
    if (req.user.role == 'admin') {
        // validate if question is valid
        if (req.body.name == null || req.body.description == null) {
            return res.status(400).send('Missing required fields')
        } else {
            await axios.post('https://76701661.problems.sphere-engine.com/api/v4/problems' + '?access_token=' + TOKEN, {
                "name": req.body.name,
                "body": req.body.description,
                "masterjudgeId": 1001
            }).then(async (response) => {
                await Question.create({
                    id: response.data.id
                })
                return res.send(response.data)
            }).catch(err => {
                res.status(400).send(err)
            })
        }
    } else {
        res.send('You are not authorized')
    }
})

// updating questions
router.post('/update-question', authenticateToken, async (req, res) => {
    if (req.user.role == 'admin') {
        // get previous question data from sphere api
        await axios.get('https://76701661.problems.sphere-engine.com/api/v4/problems' + '/' + req.body.id + '?access_token=' + TOKEN).then(response => {
            // if required fields are empty overwrite with previous data
            if (req.body.name == null) {
                req.body.name = response.data.name
            }
            if (req.body.name == null) {
                req.body.description = response.data.body
            }
        })
        await axios.put('https://76701661.problems.sphere-engine.com/api/v4/problems' + '/' + req.body.id + '?access_token=' + TOKEN, {
            "name": req.body.name,
            "body": req.body.description
        }).then(response => {
            return res.send(`Data updated`)
        }).catch(err => {
            res.status(400).send(err)
        })
    } else {
        res.send('You are not authorized')
    }
})

// deleting questions
router.post('/delete-question', authenticateToken, async (req, res) => {
    if (req.user.role == 'admin') {
        await axios.delete('https://76701661.problems.sphere-engine.com/api/v4/problems' + '/' + req.body.id + '?access_token=' + TOKEN).then(async (response) => {
            await Question.deleteOne({ id: req.body.id })
            return res.send(response.data)
        }).catch(err => {
            res.status(400).send(err)
        })
    } else {
        res.send('You are not authorized')
    }
})

router.post('/preLoded-testcases', authenticateToken, async (req, res) => {
    if (req.user.role == 'admin') {
        await axios.get('https://76701661.problems.sphere-engine.com/api/v4/problems' + '/' + req.body.id + '/' + 'testcases?access_token=' + TOKEN).then(response => {
            res.send(response.data)
        }).catch(err => {
            res.status(400).send(err)
        })
    } else {
        res.send('You are not authorized')
    }
})

router.post('/add-testcases', authenticateToken, async (req, res) => {
    if (req.user.role == 'admin') {
        await axios.post('https://76701661.problems.sphere-engine.com/api/v4/problems' + '/' + req.body.id + '/' + 'testcases?access_token=' + TOKEN, {
            "input": req.body.input,
            "output": req.body.output,
            "judgeId": 1
        }).then(response => {
            res.send(response.data)
        }).catch(err => {
            res.status(400).send(err)
        })
    } else {
        res.send('You are not authorized')
    }
})

router.post('/update-testcases', authenticateToken, async (req, res) => {
    if (req.user.role == 'admin') {
        await axios.put('https://76701661.problems.sphere-engine.com/api/v4/problems' + '/' + req.body.id + '/' + 'testcases/' + req.body.number + '?access_token=' + TOKEN, {
            "input": req.body.input,
            "output": req.body.output
        }).then(response => {
            res.send(response.data)
        }).catch(err => {
            res.status(400).send(err)
        })
    } else {
        res.send('You are not authorized')
    }
})

// submit code
router.post('/submit-code', authenticateToken, async (req, res) => {
    await axios.post(SUBMISSION_URL + '?access_token=' + TOKEN, {
        "problemId": req.body.problemId,
        "source": req.body.source,
        "compilerId": req.body.compilerId || 1
    }).then(async (response) => {
        // sent code to sphere then get the result
        await axios.get(SUBMISSION_URL + '/' + response.data.id + '?access_token=' + TOKEN).then(async (response) => {
            await saveSubmissionResult(response, req, res)
        }).catch(err => {
            res.status(400).send(err)
        })
    }).catch(err => {
        res.status(400).send(err)
    })
})

// listing all submissions
router.get('/all-submissions', authenticateToken, async (req, res) => {
    if (req.user.role == 'admin') {
        await Submission.find().then(async (submissions) => {
            res.send(submissions)
        }).catch(err => {
            res.status(400).send(err)
        })
    } else {
        res.send('You are not authorized')
    }
})

router.post('/list-user-submissions', authenticateToken, async (req, res) => {
    if (req.user.role == 'admin') {
        await Submission.find({ userEmail: req.body.email }).then(async (submissions) => {
            res.send(submissions)
        }).catch(err => {
            res.status(400).send(err)
        })
    } else {
        res.send('You are not authorized')
    }
})

router.post('/list-question-submissions', authenticateToken, async (req, res) => {
    if (req.user.role == 'admin') {
        await Submission.find({ problemId: req.body.problemId }).then(async (submissions) => {
            res.send(submissions)
        }).catch(err => {
            res.status(400).send(err)
        })
    } else {
        res.send('You are not authorized')
    }
})

// router.get('/listSelfSubmissions', authenticateToken, async (req, res) => {
//     await Submission.find({ userEmail: req.user.email }).then(async (submissions) => {
//         res.send(submissions)
//     }).catch(err => {
//         res.status(400).send(err)
//     })
// })

// Submission takes time to run so check every second for the result
async function saveSubmissionResult(response, req, res) {
    if (response.data.result.status.name == 'compiling...') {
        sleep(1000).then(async () => {
            await axios.get(SUBMISSION_URL + '/' + response.data.id + '?access_token=' + TOKEN).then(async (response) => {
                await saveSubmissionResult(response, req, res)
            }).catch(err => {
                res.status(400).send(err)
            })
        })
    } else {
        const submission = await Submission.create({
            submissionId: response.data.id,
            problemId: response.data.problem.id,
            userEmail: req.user.email,
            submissionResponse: response.data.result.status.name
        }).then(() => {
            res.send(submission.submissionResponse)
        }).catch(err => {
            res.status(400).send(err)
        })
    }
}

// generate access token
function accessTokenGenerator(user) {
    return jwt.sign(
        {
            name: user.name,
            email: user.email,
            role: user.role
        },
        process.env.JWT_ACCESS_TOKEN,
        { expiresIn: '10m' }
    )
}

// generate refresh token
function refreshTokenGenerator(user) {
    const refreshToken = jwt.sign(
        {
            name: user.name,
            email: user.email,
            role: user.role
        },
        process.env.JWT_REFRESH_TOKEN
    )
    refreshTokens.push(refreshToken)
    return refreshToken
}

// authenticating token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) {
        return res.status(401).send('Token is invalid')
    } else {
        jwt.verify(token, process.env.JWT_ACCESS_TOKEN, (err, user) => {
            if (err) {
                return res.status(403).send('Token is invalid')
            } else {
                req.user = user
                next()
            }
        })
    }
}
module.exports = router;