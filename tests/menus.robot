*** Settings ***
Library    SeleniumLibrary
Library    OperatingSystem

Suite Setup    Create Directory    ${CURDIR}${/}results
Suite Teardown    Close All Browsers

*** Variables ***
${URL}    http://localhost:5173
${BROWSER}    Edge

*** Keywords ***
Admin Login
    Open Browser    ${URL}    ${BROWSER}
    Wait Until Page Contains    Login    10s
    Input Text    xpath=//input[@placeholder='Username']    test1
    Input Text    xpath=//input[@placeholder='Password']    123456
    Click Button    xpath=//button[contains(text(),'Login')]
    Wait Until Page Contains    Dashboard    10s
    Go To    ${URL}/admin/menus
    Wait Until Page Contains    จัดการเมนู    10s
    Sleep    2s

*** Test Cases ***
1. แสดงรายการเมนู
    Admin Login
    Wait Until Page Contains    จัดการเมนู    10s
    Element Should Be Visible    xpath=//table
    Element Should Contain    xpath=//table    ชื่อเมนู
    Element Should Contain    xpath=//table    ประเภท
    Element Should Contain    xpath=//table    ราคา
    Capture Page Screenshot    ${CURDIR}${/}results${/}Menus-List.png
    Close Browser

2. เพิ่มเมนูใหม่
    Admin Login
    Input Text    xpath=//input[@placeholder='ชื่อเมนู']    testfood
    Input Text    xpath=//input[@placeholder='ประเภท']    testfood
    Input Text    xpath=//input[@placeholder='ราคา']    55
    Input Text    xpath=//input[@placeholder='Image URL']    https://ichef.bbci.co.uk/ace/ws/640/cpsprodpb/cbc1/live/74fe8e20-5170-11ed-ac87-630245663c6a.png.webp
    Click Element    xpath=//label[.//span[contains(text(),'พร้อมขาย')]]//input[@type='checkbox']
    Click Button    xpath=//button[contains(text(),'เพิ่มเมนู')]
    Wait Until Page Contains    testfood    10s
    Capture Page Screenshot    ${CURDIR}${/}results${/}Menus-Add.png
    Close Browser

3. เพิ่มเมนูโดยไม่กรอกข้อมูลครบ
    Admin Login
    # ไม่กรอกชื่อเมนู
    Input Text    xpath=//input[@placeholder='ประเภท']    testfood
    Input Text    xpath=//input[@placeholder='ราคา']    55
    Click Button    xpath=//button[contains(text(),'เพิ่มเมนู')]
    ${result}=    Run Keyword And Ignore Error    Handle Alert    action=ACCEPT
    Should Contain    ${result[1]}    กรุณากรอก Name, Category และ Base Price ให้ครบ
    Capture Page Screenshot    ${CURDIR}${/}results${/}Menus-Add-Invalid.png
    Close Browser

4. แก้ไขข้อมูลเมนู
    Admin Login
    Click Button    xpath=//tr[td[contains(text(),'testfood')]]//button[contains(text(),'แก้ไข')]
    Input Text      xpath=//tr[td/input[@value='testfood']]//input[@value='testfood']    updatefood
    Click Button    xpath=//button[contains(text(),'บันทึก')]
    Wait Until Page Contains    updatefood    10s
    Capture Page Screenshot    ${CURDIR}${/}results${/}Menus-Edit.png
    Close Browser

5. กดยกเลิกในโหมดแก้ไข
    Admin Login
    Click Button    xpath=//tr[td[contains(text(),'testfood')]]//button[contains(text(),'แก้ไข')]
    Click Button    xpath=//button[contains(text(),'ยกเลิก')]
    Wait Until Page Contains    updatefood    5s
    Capture Page Screenshot    ${CURDIR}${/}results${/}Menus-Edit-Cancel.png
    Close Browser

6. กดยกเลิกใน modal ยืนยันลบ
    Admin Login
    Click Button    xpath=//tr[td[contains(text(),'updatefood')]]//button[contains(text(),'ลบ')]
    Wait Until Page Contains    ยืนยันการลบเมนู    5s
    # รอปุ่ม "ยกเลิก" ใน modal โผล่
    Sleep    2s
    Wait Until Element Is Visible    xpath=//div[contains(@class,'fixed') and contains(@class,'inset-0')]//button[contains(text(),'ยกเลิก')]    5s
    # คลิกปุ่ม "ยกเลิก" ใน modal
    Click Button    xpath=//div[contains(@class,'fixed') and contains(@class,'inset-0')]//button[contains(text(),'ยกเลิก')]
    Wait Until Page Contains    updatefood    5s
    Capture Page Screenshot    ${CURDIR}${/}results${/}Menus-Delete-Cancel.png
    Close Browser

7. ลบเมนู
    Admin Login
    Click Button    xpath=//tr[td[contains(text(),'updatefood')]]//button[contains(text(),'ลบ')]
    Wait Until Page Contains    ยืนยันการลบเมนู    5s
    # รอปุ่ม "ลบ" ใน modal โผล่
    Sleep    2s
    Wait Until Element Is Visible    xpath=//div[contains(@class,'fixed') and contains(@class,'inset-0')]//button[contains(text(),'ลบ')]    5s
    # คลิกปุ่ม "ลบ" ใน modal
    Click Button    xpath=//div[contains(@class,'fixed') and contains(@class,'inset-0')]//button[contains(text(),'ลบ')]
    Wait Until Page Does Not Contain    updatefood    10s
    Capture Page Screenshot    ${CURDIR}${/}results${/}Menus-Delete.png
    Close Browser

8. Logout
    Admin Login
    Click Button    xpath=//button[contains(text(),'Logout')]
    Wait Until Page Contains    Login    10s
    Capture Page Screenshot    ${CURDIR}${/}results${/}Menus-Logout.png
    Close Browser
   