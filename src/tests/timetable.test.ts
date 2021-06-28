
const timetable = require('../lib/timetable');
const request = require('../lib/comm');
const fs = require('fs');
const parseISO = require('date-fns/parseISO');
const timezones = require('date-fns-tz')

const soe_rawdata = fs.readFileSync('src/other/timetabletest_soe.json');
const soe_timetableData = JSON.parse(soe_rawdata.toString())

const mei_rawdata = fs.readFileSync('src/other/timetabletest_soe.json');
const mei_timetableData = JSON.parse(mei_rawdata.toString())

const ce_rawdata = fs.readFileSync('src/other/timetabletest_soe.json');
const ce_timetableData = JSON.parse(ce_rawdata.toString())


jest.spyOn(request, 'request')
    .mockResolvedValueOnce(soe_rawdata)
    .mockResolvedValueOnce(mei_rawdata)
    .mockResolvedValueOnce(ce_rawdata)
    .mockResolvedValue(mei_rawdata);

test('checks if no lesson is twice in the timetable array', async () => {
    const table = await timetable.getTimeTableForWeek(0)
    const set = new Set(table.map((lesson: any) => lesson.id + lesson.start));
    expect(table.length).toBe(set.size);
})

test('checks if the right lesson is returned', async () => {
    const lessons = await timetable.getLessonsForDay(parseISO("2021-06-25"))
    expect(lessons.length).toBe(1);
    expect(lessons[0].title).toBe("I-Computermathematik");

})