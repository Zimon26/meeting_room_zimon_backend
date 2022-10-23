import cors from 'cors'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import utc from 'dayjs/plugin/utc.js'
import express from 'express'
import mysql from 'mysql'

dayjs.extend(customParseFormat)
dayjs.extend(utc)

function getDay(str) {
  let i = 0
  while (i < str.length) {
    if (str[i] === 'T') {
      break
    }
    i++
  }
  return str.slice(0, i)
}

function timeTransform(meetingTime, meetingDuration) {
  let hours = meetingTime.slice(0, 2)
  hours = parseInt(hours)
  console.log('hours ' + hours)
  let minutes = meetingTime.slice(2)
  console.log('minutes ' + minutes)
  if (minutes === ':00') {
    minutes = 0
  } else if (minutes === ':15') {
    minutes = 0.25
  } else if (minutes === ':30') {
    minutes = 0.5
  } else {
    minutes = 0.75
  }
  let startTime = hours + minutes
  let endTime = startTime + meetingDuration * 0.5
  return [startTime, endTime]
}

const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'admin123',
  database: 'meeting_room_database'
  // port默认3306就不写了
})

// 测试mysql连接是否成功
db.query('select 1', (err, result) => {
  if (err) return console.log(err.message)
  console.log(result)
})

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.get('/login', (req, res) => {
  const sql = `select * from user_info where userID = "${req.query.userID}"`
  db.query(sql, (err, result) => {
    if (err) return console.log(err.message)
    if (result[0].password !== req.query.password) {
      res.send({ message: 'wrong' })
    } else {
      res.send({ message: 'ok' })
      // 发送token等
    }
  })
})

app.get('/userInfo', (req, res) => {
  const sql = `select * from user_info where userID = "${req.query.userID}"`
  console.log(req.query.userID)
  db.query(sql, (err, result) => {
    if (err) return console.log(err.message)
    if (result.length === 1) {
      res.send({
        username: result[0].username,
        userAvatar: result[0].userAvatar,
        userType: result[0].userType
      })
    }
  })
})

app.get('/meetingInfo', (req, res) => {
  const sql = `select * from meeting_info where meetingHolder = "${req.query.meetingHolder}" limit 5`
  db.query(sql, (err, result) => {
    if (err) return console.log(err.message)
    // console.log(result)
    res.send(result)
  })
})

app.get('/userMeetingsToConfig', (req, res) => {
  // 这个地方还没考虑用户表联动，所以也是假数据
  res.send([
    {
      meetingID: 0,
      meetingTitle: '综合设计',
      meetingDay: '2022-10-11',
      meetingTime: '10:00',
      meetingDuration: 3,
      meetingHolder: 'Zimon',
      roomID: '204'
    },
    {
      meetingID: 1,
      meetingTitle: '综合设计',
      meetingDay: '2022-10-11',
      meetingTime: '10:00',
      meetingDuration: 3,
      meetingHolder: 'Zimon',
      roomID: '204'
    },
    {
      meetingID: 2,
      meetingTitle: '综合设计',
      meetingDay: '2022-10-11',
      meetingTime: '10:00',
      meetingDuration: 3,
      meetingHolder: 'Zimon',
      roomID: '204'
    },
    {
      meetingID: 3,
      meetingTitle: '综合设计',
      meetingDay: '2022-10-11',
      meetingTime: '10:00',
      meetingDuration: 3,
      meetingHolder: 'Zimon',
      roomID: '204'
    }
  ])
})

app.get('/searchMeetingRoomList', (req, res) => {
  // 能查询的会议室列表
  res.send([
    { roomID: 101 },
    { roomID: 102 },
    { roomID: 103 },
    { roomID: 104 },
    { roomID: 105 },
    { roomID: 106 },
    { roomID: 107 },
    { roomID: 108 },
    { roomID: 109 },
    { roomID: 110 },
    { roomID: 201 },
    { roomID: 202 },
    { roomID: 203 },
    { roomID: 204 },
    { roomID: 205 },
    { roomID: 206 },
  ])
})

// 根据查询的条件返回对应的会议信息
app.get('/searchMeetingLimits', (req, res) => {
  // 获取到查询条件，发给数据库查询
  // console.log(req.query.meetingDay)
  // console.log(typeof req.query.meetingDay)
  let day = ''
  if (req.query.meetingDay === '') {
    day = ''
  } else {
    let tempTime = dayjs(req.query.meetingDay)
    tempTime = dayjs.utc(tempTime).local().format('YYYY-MM-DDTHH:mm').toString()
    // console.log(tempTime)
    // 查询的日期信息
    day = getDay(tempTime)
  }

  console.log(day)
  const roomID = req.query.roomID
  let sql = ''
  // 先处理只有房间号的信息
  if (!day) {
    sql = `select * from meeting_info where roomID = ${roomID}`
  } else if (!roomID) {
    sql = `select * from meeting_info where meetingDay = "${day}"`
  } else {
    sql = `select * from meeting_info where meetingDay = "${day}" and roomID = ${roomID}`
  }
  db.query(sql, (err, result) => {
    if (err) return console.log(err.message)
    // console.log(result)
    res.send(result)
  })
  // res.send([
  //   {
  //     meetingTitle: '综合设计',
  //     meetingTimeAll: '2022-10-11 22:00',
  //     meetingDuration: '3',
  //     meetingHolder: 'Zimon',
  //     roomID: '228'
  //   },
  //   {
  //     meetingTitle: '综合设计',
  //     meetingTimeAll: '2022-10-11 22:00',
  //     meetingDuration: '3',
  //     meetingHolder: 'Zimon',
  //     roomID: '228'
  //   },
  //   {
  //     meetingTitle: '综合设计',
  //     meetingTimeAll: '2022-10-11 22:00',
  //     meetingDuration: '3',
  //     meetingHolder: 'Zimon',
  //     roomID: '228'
  //   },
  //   {
  //     meetingTitle: '综合设计',
  //     meetingTimeAll: '2022-10-11 22:00',
  //     meetingDuration: '3',
  //     meetingHolder: 'Zimon',
  //     roomID: '228'
  //   }
  // ])
})

app.get('/meetingRecord', (req, res) => {
  // 首先应该获取当前的用户名
  // console.log(req.query)
  const sql = `select * from meeting_info where meetingHolder = "${req.query.meetingHolder}"`
  db.query(sql, (err, result) => {
    if (err) return console.log(err.message)
    // console.log(result)
    res.send(result)
  })
  // res.send([
  //   {
  //     meetingTitle: '综合设计',
  //     meetingTimeAll: '2022-10-11 22:00',
  //     meetingDuration: '3',
  //     meetingHolder: 'Zimon',
  //     roomID: '228'
  //   },
  //   {
  //     meetingTitle: '综合设计',
  //     meetingTimeAll: '2022-10-11 22:00',
  //     meetingDuration: '3',
  //     meetingHolder: 'Zimon',
  //     roomID: '228'
  //   },
  //   {
  //     meetingTitle: '综合设计',
  //     meetingTimeAll: '2022-10-11 22:00',
  //     meetingDuration: '3',
  //     meetingHolder: 'Zimon',
  //     roomID: '228'
  //   },
  //   {
  //     meetingTitle: '综合设计',
  //     meetingTimeAll: '2022-10-11 22:00',
  //     meetingDuration: '3',
  //     meetingHolder: 'Zimon',
  //     roomID: '228'
  //   }
  // ])
})

app.post('/addMeeting', (req, res) => {
  // console.log(req.body)
  // 把req.body的数据加到数据库
  // 要先把meetingDay和meetingTime整合，向服务器递交的数据就是time内部的$d，实际上就是date对象
  // let i = 0
  // while (i < req.body.addMeetingForm.meetingDay.length) {
  //   if (req.body.addMeetingForm.meetingDay[i] === 'T') {
  //     break
  //   }
  //   i++
  // }
  const form = req.body.addMeetingForm
  let tempTime = dayjs(form.meetingDay)
  tempTime = dayjs.utc(tempTime).local().format('YYYY-MM-DDTHH:mm').toString()
  const newDay = getDay(tempTime)
  // console.log(newDay)
  const newRoomID = form.roomID
  const newTime = form.meetingTime
  const newDuration = form.meetingDuration
  const sql = `select * from meeting_info where meetingDay = "${newDay}" and roomID = ${newRoomID}`

  if (req.body.type === 2) {
    console.log('删除会议')
    console.log(form)
    const sqlDelete = `delete from meeting_info where meetingID = ${form.meetingID}`
    db.query(sqlDelete, (err, result) => {
      if (err) {
        console.log(err.message)
        // 发送另一个错误代码
      }
      if (result.affectedRows === 1) return res.send({ message: 'ok' })
    })
  } else { // 是修改或者添加会议
    db.query(sql, (err, result) => {
      if (err) return console.log(err.message)
      // console.log(result)
      const similarMeetings = result
      console.log('相似的会议是这些')
      console.log(similarMeetings)
      console.log('--')
      if (similarMeetings.length) {
        let time = []
        let newTimer = timeTransform(newTime, newDuration)
        console.log('newTimer是')
        console.log(newTimer)
        console.log('--')
        let flag = similarMeetings.every(item => {
          // 开始比较会议是否合法
          time = timeTransform(item.meetingTime, item.meetingDuration)
          console.log(time)
          return newTimer[0] >= time[1] || newTimer[1] <= time[0]
        })
        if (!flag) {
          console.log('不行')
          return res.send({
            message: 'conflict'
          })
        }
      }
      console.log('req.body.type = ' + req.body.type)
      if (req.body.type === 0) {
        console.log('新增会议')
        const sql2 = 'insert into meeting_info (meetingTitle, meetingDay, meetingTime, meetingDuration, roomID, meetingHolder) values(?, ?, ?, ?, ?, ?)'
        db.query(sql2, [form.meetingTitle, newDay, form.meetingTime, form.meetingDuration, form.roomID, form.meetingHolder], (err, result) => {
          if (err) return console.log(err.message)
          if (result.affectedRows === 1) {
            // 插入数据成功，用res返回正确的消息
            res.send({
              message: 'ok'
            })
          }
        })
      } else if (req.body.type === 1) {
        console.log('修改会议')
        const sql2 = 'update meeting_info set meetingTitle = ?, meetingDay = ?, meetingTime = ?, meetingDuration = ?, roomID = ?, meetingHolder = ? where meetingID = ?'
        db.query(sql2, [form.meetingTitle, newDay, form.meetingTime, form.meetingDuration, form.roomID, form.meetingHolder, form.meetingID], (err, result) => {
          if (err) return console.log(err.message)
          if (result.affectedRows === 1) {
            // 插入数据成功，用res返回正确的消息
            res.send({
              message: 'ok'
            })
          }
        })
      }
    })
  }


  // 判断会议的预定时间是否合法
  // let { data: similarMeetings } = await this.http.get('searchMeetingLimits', {
  //   params: {
  //     meetingDay: this.addMeetingForm.meetingDay,
  //     roomID: this.addMeetingForm.roomID
  //   }
  // })



  // console.log(this.addMeetingForm)
  // console.log('--')

  // console.log('可能产生冲突的会议')
  // console.log(similarMeetings)
  // console.log('--')


  // 不采用这种混合方式存储数据，分立存储时间和日期
  // const timeStr = day + ' ' + req.body.addMeetingForm.meetingTime;

  // 这个位置用来判断是否有时间的冲突，非常重要，后续添加

  // let time = dayjs(timeStr, 'YYYY-MM-DD HH-mm').$d
  // console.log(time.$d instanceof Date)
  // 把数据都存到数据库

})

app.listen(8888, () => {
  console.log('server on')
})