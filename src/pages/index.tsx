import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import allLocales from "@fullcalendar/core/locales-all";
import googleCalendarPlugin from "@fullcalendar/google-calendar";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import DatePicker, { registerLocale } from "react-datepicker";
import ja from "date-fns/locale/ja";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "../../components/fire";
import "firebase/compat/auth";
import Head from "next/head";

import classes from "@/styles/Home.module.css";
import "react-datepicker/dist/react-datepicker.css";
import styled from "@emotion/styled";

var auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();
const db = firebase.firestore();
auth.signOut();
registerLocale("ja", ja);
interface myEventsType {
  id: any;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  backgroundColor: string;
}

export default function Home() {
  const ref = React.createRef<any>();
  let id = "";
  const eventArray: Array<myEventsType> = [];
  const [inId, setInId] = useState("");
  const [inputTitle, setInputTitle] = useState(""); // フォームに入力されたタイトル。
  const [inputStart, setInputStart] = useState(new Date()); // イベントの開始時刻
  const [inputEnd, setInputEnd] = useState(new Date()); // イベントの終了時刻
  const [inputColor, setInputColor] = useState("#327fec"); // フォームに入力されたタイトル。
  const [inView, setInView] = useState(false); // イベント登録フォームの表示有無。(trueなら表示する。)
  const [isChange, setIsChange] = useState(false); // 既存イベントをクリックするとtrue
  const [allday, setAllday] = useState(false); // 終日イベントかどうか

  useEffect(() => {
    firebase
      .auth()
      .signInWithPopup(provider)
      .then((result) => {
        console.log(result.user.email);

        if (result.user != null) {
          db.collection(result.user.email) //.orderBy("start", "desc")
            .get()
            .then(async (snapshot) => {
              for await (const document of snapshot.docs) {
                const doc = document.data(); 
                const oneMonth = 31 * 24 * 60 * 60 * 1000;
                // console.log(
                //   (new Date().getTime() - doc.start.toDate().getTime()) /
                //     oneMonth
                // );
                if (
                  (new Date().getTime() - doc.start.toDate().getTime()) /
                    oneMonth > 2
                ) {
                  setInId(document.id);
                  db.collection(result.user.email).doc(document.id).delete();
                }

                ref.current.getApi().addEvent({
                  id: document.id,
                  title: doc.title,
                  start: doc.start.toDate(),
                  end: doc.end.toDate(),
                  allDay: doc.allDay,
                  backgroundColor: doc.backgroundColor,
                });
                //eventArray.push({id: doc.id, title: doc.title, start: doc.start.toDate(), end: doc.end.toDate()})
              }
              //setMyEvents(eventArray)
            });
        }
      });
  }, []);

  // 既存イベントをクリックしたとき
  const handleCLick = (info: any) => {
    /*const event = myEvents[info.event.id]*/
    const id = info.event.id;
    const title = info.event.title;
    const start = info.event.start;
    const end = info.event.end;

    setInId(id);
    setInputTitle(title);
    setInputStart(start);
    setInputEnd(end);
    setInView(true);
    setIsChange(true);
  };

  // 範囲選択したとき
  const handleSelect = (selectinfo: any) => {
    const start = new Date(selectinfo.start);
    const end = new Date(selectinfo.end);
    start.setHours(start.getHours());
    end.setHours(end.getHours());

    setInputTitle("");
    setInputStart(start);
    setInputEnd(end);
    setInView(true);
  };

  const onAddEvent = () => {
    const startTime = inputStart;
    const endTime = inputEnd;

    if (startTime >= endTime) {
      alert("開始時間と終了時間を確認してください。");
      return;
    }
    const event: myEventsType = {
      /*id: myEvents.length,*/
      id: new Date().toString(), //db.collection("event").doc().toString(),
      title: inputTitle,
      start: startTime,
      end: endTime,
      allDay: allday,
      backgroundColor: inputColor,
    };

    ref.current.getApi().addEvent(event);
    db.collection(auth.currentUser.email)
      .doc(event.id)
      .set(event)
      .then(() => {
        setInView(false);
        setAllday(false);
      });
  };

  const onDeleteEvent = () => {
    ref.current.getApi().getEventById(inId).remove();
    db.collection(auth.currentUser.email)
      .doc(inId)
      .delete()
      .then(() => {
        setInView(false);
        setIsChange(false);
      });
  };

  const onChangeEvent = () => {
    const startTime = inputStart;
    const endTime = inputEnd;
    if (startTime >= endTime) {
      alert("開始時間と終了時間を確認してください。");
      return;
    }
    const event: myEventsType = {
      /*id: myEvents.length,*/
      id: new Date().toString(), //db.collection("event").doc().toString(),
      title: inputTitle,
      start: startTime,
      end: endTime,
      allDay: allday,
      backgroundColor: inputColor,
    };

    ref.current.getApi().getEventById(inId).remove();
    ref.current.getApi().addEvent(event);
    db.collection(auth.currentUser.email)
      .doc(inId)
      .delete()
      .then(() => {
        db.collection(auth.currentUser.email)
          .doc(event.id)
          .set(event)
          .then(() => {
            setIsChange(false);
            setInView(false);
          });
      });
  };

  // フォーム表示時にフォーム以外を暗くする
  const coverElement = (
    <div
      onClick={() => {
        setIsChange(false);
        setInView(false);
        setAllday(false);
      }}
      className={inView ? `${classes.cover} ${classes.inView}` : classes.cover}
    />
  );

  const titleElement = (
    <div>
      <label>
        タイトル
        <input
          className={classes.text}
          type="text"
          value={inputTitle}
          name="inputTitle"
          onChange={(e) => {
            // タイトルが入力されたら、その値をStateに登録する。
            setInputTitle(e.target.value);
          }}
        />
      </label>
    </div>
  );

  const startTimeElement = (
    <div className={classes.area}>
      <label>
        開始
        <DatePicker
          className={classes.picker}
          locale="ja"
          dateFormat="yyyy/MM/d HH:mm"
          selected={inputStart}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={10}
          todayButton="today"
          name="inputStart"
          onChange={(time: Date) => {
            setInputStart(time);
          }}
        />
      </label>
    </div>
  );

  const endTimeElement = (
    <div className={classes.area}>
      <label>
        終了
        <DatePicker
          className={classes.picker}
          locale="ja"
          dateFormat="yyyy/MM/d HH:mm"
          selected={inputEnd}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={10}
          todayButton="today"
          name="inputEnd"
          onChange={(time: Date) => {
            setInputEnd(time);
          }}
        />
      </label>
    </div>
  );
  const alldayElement = (
    <div className={classes.area}>
      <label>
        <input
          className={classes.check}
          type="checkbox"
          //value="終日"
          checked={allday}
          onChange={() => {
            setAllday(!allday);
          }}
        />
        終日
      </label>
    </div>
  );
  const colorElement = (
    <div>
      <label>
        <input
          className={classes.color}
          type="color"
          value={inputColor}
          onChange={(e) => {
            // タイトルが入力されたら、その値をStateに登録する。
            setInputColor(e.target.value);
          }}
        />
        イベントの色
      </label>
    </div>
  );
  const btnElement = (
    <div>
      {!isChange ? (
        <div>
          <input
            className={classes.button}
            type="button"
            value="キャンセル"
            onClick={() => {
              setInView(false);
            }}
          />
          <input
            className={classes.rightButton}
            type="button"
            value="保存"
            onClick={() => onAddEvent()}
          />
        </div>
      ) : (
        <div>
          <input
            className={classes.button}
            type="button"
            value="キャンセル"
            onClick={() => {
              setInView(false);
            }}
          />
          <input
            className={classes.deleteButton}
            type="button"
            value="削除"
            onClick={() => onDeleteEvent()}
          />
          <input
            className={classes.rightButton}
            type="button"
            value="変更"
            onClick={() => onChangeEvent()}
          />
        </div>
      )}
    </div>
  );

  const formElement = (
    <div
      className={
        inView
          ? `${classes.form} ${classes.inView}` // inViewでopacityとvisibleを上書き
          : classes.form
      }
    >
      <form>
        {!isChange ? (
          <div className={classes.headline}>予定を入力</div>
        ) : (
          <div className={classes.headline}>予定を変更</div>
        )}
        {titleElement}
        {startTimeElement}
        {endTimeElement}
        {alldayElement}
        {colorElement}
        {btnElement}
      </form>
    </div>
  );

  let past = new Date();
  past.setMonth(past.getMonth() - 3);

  return (
    <div className={classes.margin}>
      <Head>
        <title>C0de カレンダー</title>
        <meta
          name="description"
          content="名工大プログラミング部C0deのWeb班が制作したカレンダーアプリです。Googleアカウントでログインできます。"
        />
      </Head>
      {coverElement}
      {formElement}
      <StyleWrapper>
        <FullCalendar
          locales={allLocales}
          locale="ja" // 日本語
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            listPlugin,
            googleCalendarPlugin,
          ]}
          initialView="dayGridMonth"
          selectable={true} // 日付選択を可能にする。interactionPluginが有効になっている場合のみ。
          droppable={true}
          // businessHours={{ // ビジネス時間の設定。
          //   daysOfWeek: [1, 2, 3, 4, 5], // 0:日曜 〜 7:土曜
          //   startTime: '00:00',
          //   endTime: '24:00'
          // }}
          dayCellContent={(e) => e.dayNumberText.replace("日", "")} // 「日」を消す
          //events={myEvents}
          /*dateClick={handleDateClick} */
          headerToolbar={{
            start: "dayGridMonth,timeGridWeek,listMonth", // 月・週表示
            center: "title",
            end: "prev,next today", // 「前月を表示」、「次月を表示」、「今日を表示」
          }}
          weekends={true} // 週末表示
          ref={ref}
          eventClick={handleCLick}
          select={handleSelect}
          validRange={{
            // 表示範囲
            start: past,
          }}
          listDayFormat={
            //window.matchMedia( "(min-width: 700px)" ).matches?
            {
              month: "short",
              day: "numeric",
              weekday: "short",
            }
          }
          // eventSources={[
          //   {
          //     googleCalendarApiKey: 'AIzaSyAMCiM2xiNtJlOxijzfOZf6H2EAgshp_VM',
          //     googleCalendarId: 'japanese__ja@holiday.calendar.google.com',
          //     display: 'background',
          //     color:"#f6d1d1",
          //   }
          // ]}
          listDaySideFormat={false}
          height={"auto"}
          buttonText={{
            // today:    'today',
            // month:    'month',
            // week:     'week',
            // day:      'day',
            list: "リスト",
          }}
          views={{
            timeGridWeek: {
              titleFormat: { month: "short", day: "numeric", weekday: "short" },
              dayHeaderFormat: {
                day: "numeric",
                weekday: "short",
              },
            },
          }}
        />
      </StyleWrapper>
    </div>
  );
}

const StyleWrapper = styled.div`
  /* 日曜日 */
  .fc-day-sun {
    // color: rgb(255, 10, 10);
    background-color: #fff4f4;
  }

  /* 土曜日 */
  .fc-day-sat {
    // color: rgb(10, 10, 255);
    background-color: #f0f0ff;
  }
  .fc .fc-toolbar.fc-header-toolbar {
    // margin-bottom: 0;
  }
  .fc .fc-toolbar-title {
    @media (max-width: 670px) {
      font-size: 1.4rem;
    }
    // color: #37362f;
  }
  .fc .fc-button-primary {
    // background-color: #ffffff00;
    // color: #acaba9;
    border: 1px solid #aaa;
    // outline: none;
  }
  .fc .fc-today-button {
    // background-color: #ffffff00;
    // color: #37362f;
    // border: none;
    // outline: none;
  }
  .fc .fc-button-primary:not(:disabled):active,
  .fc .fc-button-primary:not(:disabled).fc-button-active {
    // background-color: #ffffff00;
    // color: #acaba9;
    // box-shadow: none;
  }
  .fc .fc-button-primary:not(:disabled):focus,
  .fc .fc-button-primary:not(:disabled).fc-button-focus {
    // background-color: #ffffff00;
    // color: #acaba9;
    // box-shadow: none;
  }
  .fc .fc-today-button:disabled {
    // opacity: 1;
  }
  .fc-dayGridMonth-button {
    margin-left: 5px;
  }
`;
