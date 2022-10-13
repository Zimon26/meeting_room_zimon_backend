import cors from 'cors'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import express from 'express'
import mysql from 'mysql'

dayjs.extend(customParseFormat)

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

app.get('/meetingInfo', (req, res) => {
  res.send([
    { id: 100, time: '2022-10-6', title: '综合设计', holder: 'Zimon' },
    { id: 101, time: '2022-10-6', title: '综合设计', holder: 'Zimon' },
    { id: 102, time: '2022-10-6', title: '综合设计', holder: 'Zimon' }
  ])
})

app.get('/userMeetingsToConfig', (req, res) => {
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
  console.log(req.query)
  // 查询的日期信息
  const day = getDay(req.query.meetingDay)
  res.send([
    {
      meetingTitle: '综合设计',
      meetingTimeAll: '2022-10-11 22:00',
      meetingDuration: '3',
      meetingHolder: 'Zimon',
      roomID: '228'
    },
    {
      meetingTitle: '综合设计',
      meetingTimeAll: '2022-10-11 22:00',
      meetingDuration: '3',
      meetingHolder: 'Zimon',
      roomID: '228'
    },
    {
      meetingTitle: '综合设计',
      meetingTimeAll: '2022-10-11 22:00',
      meetingDuration: '3',
      meetingHolder: 'Zimon',
      roomID: '228'
    },
    {
      meetingTitle: '综合设计',
      meetingTimeAll: '2022-10-11 22:00',
      meetingDuration: '3',
      meetingHolder: 'Zimon',
      roomID: '228'
    }
  ])
})

app.get('/meetingRecord', (req, res) => {
  res.send([
    {
      meetingTitle: '综合设计',
      meetingTimeAll: '2022-10-11 22:00',
      meetingDuration: '3',
      meetingHolder: 'Zimon',
      roomID: '228'
    },
    {
      meetingTitle: '综合设计',
      meetingTimeAll: '2022-10-11 22:00',
      meetingDuration: '3',
      meetingHolder: 'Zimon',
      roomID: '228'
    },
    {
      meetingTitle: '综合设计',
      meetingTimeAll: '2022-10-11 22:00',
      meetingDuration: '3',
      meetingHolder: 'Zimon',
      roomID: '228'
    },
    {
      meetingTitle: '综合设计',
      meetingTimeAll: '2022-10-11 22:00',
      meetingDuration: '3',
      meetingHolder: 'Zimon',
      roomID: '228'
    }
  ])
})

app.post('/addMeeting', (req, res) => {
  console.log(req.body)
  // 把req.body的数据加到数据库
  // 要先把meetingDay和meetingTime整合，向服务器递交的数据就是time内部的$d，实际上就是date对象
  // let i = 0
  // while (i < req.body.addMeetingForm.meetingDay.length) {
  //   if (req.body.addMeetingForm.meetingDay[i] === 'T') {
  //     break
  //   }
  //   i++
  // }
  const day = getDay(req.body.addMeetingForm.meetingDay)
  const timeStr = day + ' ' + req.body.addMeetingForm.meetingTime;

  // 这个位置用来判断是否有时间的冲突，非常重要，后续添加

  // let time = dayjs(timeStr, 'YYYY-MM-DD HH-mm').$d
  // console.log(time.$d instanceof Date)
  // 把数据都存到数据库
  const form = req.body.addMeetingForm
  const sql = 'insert into meeting_info (meetingTitle, meetingTime, meetingDuration, roomID, meetingHolder) values(?, ?, ?, ?, ?)'
  db.query(sql, [form.meetingTitle, timeStr, form.meetingDuration, form.roomID, form.meetingHolder], (err, result) => {
    if (err) return console.log(err.message)
    if (result.affectedRows === 1) {
      // 插入数据成功，用res返回正确的消息
    }
  })
})

app.listen(8888, () => {
  console.log('server on')
})