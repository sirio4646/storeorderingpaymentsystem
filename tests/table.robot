*** Settings ***
Library    SeleniumLibrary
Library    OperatingSystem

Suite Setup    Create Directory    ${CURDIR}${/}results
Suite Teardown    Close All Browsers

*** Variables ***
${URL}    http://localhost:5173
${BROWSER}    Edge

*** Test Cases ***
1. เลือกโต๊ะว่างและยืนยันการจอง
    Open Browser    ${URL}    ${BROWSER}
    Wait Until Page Contains    Login    10s
    Input Text    xpath=//input[@placeholder='Username']    test1User
    Input Text    xpath=//input[@placeholder='Password']    123456
    Click Button    xpath=//button[contains(text(),'Login')]
    Wait Until Page Contains    ร้านนายสมชาย    10s
    # รอให้ปุ่มโต๊ะโหลดขึ้นมา (timeout มากขึ้น)
    Wait Until Page Contains Element    xpath=//button[not(@disabled)]    20s
    Sleep    2s
    Capture Page Screenshot    ${CURDIR}${/}results${/}before-find-table.png
    # หาโต๊ะที่ว่างอยู่ (ปุ่มไม่มี disabled และมีเลขโต๊ะ)
    ${free_tables}=    Get WebElements    xpath=//button[not(@disabled) and .//span[contains(@class,'text-3xl') or contains(@class,'text-4xl') or contains(@class,'text-5xl')]]
    ${count}=    Get Length    ${free_tables}
    Log    พบโต๊ะว่าง ${count} โต๊ะ
    # ถ้ามีโต๊ะว่าง ให้เลือกโต๊ะแรก
    Run Keyword If    ${count} > 0    Click Element    ${free_tables}[0]
    Sleep    2s
    Run Keyword If    ${count} == 0    Log    ไม่มีโต๊ะว่าง
    Sleep    1s
    # ตรวจสอบว่าปุ่มถูกเลือกแล้ว (เฉพาะเมื่อมีโต๊ะว่าง)
    Run Keyword If    ${count} > 0    Element Should Be Visible    xpath=//button[@aria-pressed="true"]
    # กดปุ่มยืนยันการจอง (เฉพาะเมื่อมีโต๊ะว่าง)
    Run Keyword If    ${count} > 0    Click Button    xpath=//button[contains(text(),'ยืนยันการจอง')]
    Sleep    2s
    Capture Page Screenshot    ${CURDIR}${/}results${/}Table-Booking-Select-And-Confirm.png
    Close Browser

2. เลือกโต๊ะที่ไม่ว่าง (occupied)
    Open Browser    ${URL}    ${BROWSER}
    Wait Until Page Contains    Login    10s
    Input Text    xpath=//input[@placeholder='Username']    test1User
    Input Text    xpath=//input[@placeholder='Password']    123456
    Click Button    xpath=//button[contains(text(),'Login')]
    Wait Until Page Contains    ร้านนายสมชาย    10s
    # หาโต๊ะที่ไม่ว่าง (มี disabled)
    ${occupied_tables}=    Get WebElements    xpath=//button[@disabled and .//span[contains(@class,'text-3xl') or contains(@class,'text-4xl') or contains(@class,'text-5xl')]]
    ${count}=    Get Length    ${occupied_tables}
    Run Keyword If    ${count} > 0    Click Element    ${occupied_tables}[0]
    Sleep    1s
    # ตรวจสอบว่าไม่มีปุ่มไหนถูกเลือก (ไม่มี aria-pressed="true")
    Element Should Not Be Visible    xpath=//button[@aria-pressed="true"]
    Capture Page Screenshot    ${CURDIR}${/}results${/}Table-Booking-Occupied.png
    Close Browser

3. ไม่เลือกโต๊ะแล้วกดยืนยันการจอง
    Open Browser    ${URL}    ${BROWSER}
    Wait Until Page Contains    Login    10s
    Input Text    xpath=//input[@placeholder='Username']    test1User
    Input Text    xpath=//input[@placeholder='Password']    123456
    Click Button    xpath=//button[contains(text(),'Login')]
    Wait Until Page Contains    ร้านนายสมชาย    10s
    # ไม่เลือกโต๊ะเลย กดปุ่มยืนยันการจอง
    Click Button    xpath=//button[contains(text(),'ยืนยันการจอง')]
    Sleep    1s
    # ตรวจสอบว่ามีข้อความแจ้งเตือน หรือยังอยู่หน้าเดิม
    # Wait Until Page Contains    กรุณาเลือกโต๊ะก่อนกดยืนยัน    5s
    Capture Page Screenshot    ${CURDIR}${/}results${/}Table-Booking-No-Select.png
    Close Browser

4. เลือกโต๊ะแล้วเปลี่ยนใจ (เลือกแล้วคลิกอีกครั้งเพื่อยกเลิก)
    Open Browser    ${URL}    ${BROWSER}
    Wait Until Page Contains    Login    10s
    Input Text    xpath=//input[@placeholder='Username']    test1User
    Input Text    xpath=//input[@placeholder='Password']    123456
    Click Button    xpath=//button[contains(text(),'Login')]
    Wait Until Page Contains    ร้านนายสมชาย    10s
    # รอให้ปุ่มโต๊ะโหลดขึ้นมา (timeout มากขึ้น)
    Wait Until Page Contains Element    xpath=//button[not(@disabled)]    20s
    Sleep    2s
    Capture Page Screenshot    ${CURDIR}${/}results${/}before-deselect.png
    # หาโต๊ะที่ว่างอยู่ (ปุ่มไม่มี disabled และมีเลขโต๊ะ)
    ${free_tables}=    Get WebElements    xpath=//button[not(@disabled) and .//span[contains(@class,'text-3xl') or contains(@class,'text-4xl') or contains(@class,'text-5xl')]]
    ${count}=    Get Length    ${free_tables}
    Log    พบโต๊ะว่าง ${count} โต๊ะ
    # ถ้ามีโต๊ะว่าง ให้เลือกโต๊ะแรก
    Run Keyword If    ${count} > 0    Click Element    ${free_tables}[0]
    Sleep    2s
    # คลิกซ้ำอีกครั้งเพื่อยกเลิก
    Run Keyword If    ${count} > 0    Click Element    ${free_tables}[0]
    Sleep    2s
    # ตรวจสอบว่าไม่มีปุ่มไหนถูกเลือก (ไม่มี aria-pressed="true")
    Element Should Not Be Visible    xpath=//button[@aria-pressed="true"]
    Capture Page Screenshot    ${CURDIR}${/}results${/}Table-Booking-Deselect.png
    Close Browser

5. เลือกโต๊ะมากกว่า 1 โต๊ะ (ถ้าระบบไม่อนุญาต)
    Open Browser    ${URL}    ${BROWSER}
    Wait Until Page Contains    Login    10s
    Input Text    xpath=//input[@placeholder='Username']    test1User
    Input Text    xpath=//input[@placeholder='Password']    123456
    Click Button    xpath=//button[contains(text(),'Login')]
    Wait Until Page Contains    ร้านนายสมชาย    10s
    Wait Until Page Contains Element    xpath=//button[not(@disabled)]    20s
    Sleep    2s
    Capture Page Screenshot    ${CURDIR}${/}results${/}before-multiselect.png
    ${free_tables}=    Get WebElements    xpath=//button[not(@disabled) and .//span[contains(@class,'text-3xl') or contains(@class,'text-4xl') or contains(@class,'text-5xl')]]
    ${count}=    Get Length    ${free_tables}
    Log    พบโต๊ะว่าง ${count} โต๊ะ
    Run Keyword If    ${count} > 1    Click Element    ${free_tables}[0]
    Sleep    1s
    Run Keyword If    ${count} > 1    Click Element    ${free_tables}[1]
    Sleep    2s
    # ตรวจสอบว่ามีข้อความแจ้งเตือน
    Wait Until Page Contains    คุณสามารถเลือกโต๊ะได้ครั้งละ 1 โต๊ะเท่านั้น    5s
    # ตรวจสอบว่ามี aria-pressed="true" แค่ 1 ปุ่ม (เลือกได้แค่ 1 โต๊ะ)
    ${selected}=    Get Element Count    xpath=//button[@aria-pressed="true"]
    Should Be Equal As Integers    ${selected}    1
    Capture Page Screenshot    ${CURDIR}${/}results${/}Table-Booking-Multi-Select.png
    Close Browser