-- ============================================================
-- UIUPC CORE DATA MIGRATION v3
-- Generated: 2026-04-27T20:34:22.415Z
-- Run this in Supabase Dashboard > SQL Editor
-- NOTE: Exhibition data (Shutter Stories IV) is archived
--       in CSV and will be imported separately later.
-- ============================================================

BEGIN;

-- ============================================================
-- MEMBERS MIGRATION (62 clean records, 2 skipped as corrupted)
-- ============================================================

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Md.Eakub Ali( Hridoy)',
  'Fall 25',
  '212330012',
  'mali2330012@bseee.uiu.ac.bd',
  'Electrical & Electronic Engineering',
  '1817898562',
  NULL,
  NULL,
  'cash',
  NULL,
  NULL,
  '2025-11-15T07:01:07.526Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Nayon Mondol',
  'Fall 25',
  '112530058',
  'nmondol2530058@bscse.uiu.ac.bd',
  'Computer Science & Engineering',
  '1734528806',
  NULL,
  NULL,
  'cash',
  NULL,
  'https://drive.google.com/file/d/1QCq_o6TIG6kTLO4mCbSyrhe0ct6NlYx1/view?usp=drivesdk',
  '2025-11-15T07:02:08.776Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Ameenah Binte Mahbub',
  'Fall 25',
  '212530017',
  'amahbub2530017@bseee.uiu.ac.bd',
  'Electrical & Electronic Engineering',
  '1776045461',
  NULL,
  NULL,
  'cash',
  NULL,
  NULL,
  '2025-11-15T07:49:29.322Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Salman Hasan Ratul',
  'Fall 25',
  '1142510007',
  'sratul2510007@bba-ais.uiu.ac.bd',
  'Business Administration',
  '1935236492',
  NULL,
  NULL,
  'cash',
  NULL,
  'https://drive.google.com/file/d/1ziqXTGPBd8aiMTAoInPn8uhbEO71aY_R/view?usp=drivesdk',
  '2025-11-15T08:19:15.539Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Ashpia khan Ahona',
  'Fall 25',
  '1112510028',
  'aahona2510028@bba.uiu.ac.bd',
  'Business Administration',
  '1872165785',
  NULL,
  NULL,
  'cash',
  NULL,
  'https://drive.google.com/file/d/1vB33TwYNQDXF8jcJaZFW15-1FhmNYVp9/view?usp=drivesdk',
  '2025-11-15T08:19:26.272Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Sadik Abdullah',
  'Fall 25',
  '112530044',
  'sabdullah2530044@bscse.uiu.ac.bd',
  'Computer Science & Engineering',
  '1708071098',
  NULL,
  NULL,
  'cash',
  NULL,
  'https://drive.google.com/file/d/1mrN-hAgMyGXmTiSIEyPQkb3IdKzifuya/view?usp=drivesdk',
  '2025-11-15T08:49:45.772Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Khandhaker Towfiqul Islam',
  'Fall 25',
  '1112420096',
  'randomeyes.click@gmail.com',
  'Business Administration',
  '1705589540',
  NULL,
  NULL,
  'bkash',
  'CKG38VMCLT',
  'https://drive.google.com/file/d/10AIbWVj9Uk0-rJ6GqVNtPRx0pIFtUvTB/view?usp=drivesdk',
  '2025-11-15T16:04:29.306Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Sadika Salam',
  'Fall 25',
  '1112420183',
  'ssalam2420183@bba.uiu.ac.bd',
  'Business Administration',
  '1931193382',
  NULL,
  NULL,
  'cash',
  NULL,
  NULL,
  '2025-11-16T04:31:42.355Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Zawad ibn hossain',
  'Fall 25',
  '1112520056',
  'zhossain2520056@bba.uiu.ac.bd',
  'Business Administration',
  '1533240610',
  NULL,
  NULL,
  'cash',
  NULL,
  'https://drive.google.com/file/d/1JHLr1CW7BDRaqOrsVCLD5tCwas_zKAA7/view?usp=drivesdk',
  '2025-11-16T04:59:14.343Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Samin Tasnim',
  'Fall 25',
  '112530170',
  'stasnim2530170@bscse.uiu.ac.bd',
  'Computer Science & Engineering',
  '8801773868810',
  NULL,
  NULL,
  'due',
  NULL,
  NULL,
  '2025-11-16T05:22:48.062Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'MD. Rakin Wazed',
  'Fall 25',
  '112520259',
  'mwazed2520259@bscse.uiu.ac.bd',
  'Computer Science & Engineering',
  '1878939487',
  NULL,
  NULL,
  'cash',
  NULL,
  'https://drive.google.com/file/d/1fackSaWKGPqPCMo2gLaBuunX8Z1EFMiA/view?usp=drivesdk',
  '2025-11-16T05:28:59.843Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Aisha Amin Jerin',
  'Fall 25',
  '112520010',
  'ajerin2520010@bscse.uiu.ac.bd',
  'Computer Science & Engineering',
  '1933639086',
  NULL,
  NULL,
  'bkash',
  'CKG194ETOB',
  NULL,
  '2025-11-16T05:36:07.959Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Farhan Chowdhury',
  'Fall 25',
  '1142510003',
  'fchowdhury2510003@bba-ais.uiu.ac.bd',
  'Business Administration',
  '1844257017',
  NULL,
  NULL,
  'bkash',
  'CKG294MA0W',
  'https://drive.google.com/file/d/1iDE5f0L3KPUN2WmgiiRD3bHr-lpj3G8w/view?usp=drivesdk',
  '2025-11-16T05:42:09.829Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Khondokar Numan',
  'Fall 25',
  '112510349',
  'khondokarnuman720@gmail.com',
  'Computer Science & Engineering',
  '1845211975',
  NULL,
  NULL,
  'due',
  NULL,
  'https://drive.google.com/file/d/1t2gc4UEcBNYnVpgbhd4t-xUEgTcHrIhx/view?usp=drivesdk',
  '2025-11-16T06:51:02.071Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'SAGOR PAL',
  'Fall 25',
  '112510049',
  'spal2510049@bscse.uiu.ac.bd',
  'Computer Science & Engineering',
  '1521764419',
  NULL,
  NULL,
  'cash',
  NULL,
  'https://drive.google.com/file/d/1vO2__UgUqzgOeIxa1AzDYJbM7em8sOnT/view?usp=drivesdk',
  '2025-11-16T06:53:35.605Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Shrobon sarkar',
  'Fall 25',
  '112510036',
  'ssarkar2510036@bscse.uiu.ac.bd',
  'Computer Science & Engineering',
  '1338055347',
  NULL,
  NULL,
  'cash',
  NULL,
  'https://drive.google.com/file/d/19iF0P_ygLBXKM5wkoTQGC9Fnl9ngB9cj/view?usp=drivesdk',
  '2025-11-16T06:54:37.492Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Md.Mishfiqur Rahman',
  'Fall 25',
  '112510171',
  'mrahman2510171@bscse.uiu.ac.bd',
  'Computer Science & Engineering',
  '1833806305',
  NULL,
  NULL,
  'cash',
  NULL,
  NULL,
  now()
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Hasan Mahmud Turja',
  'Fall 25',
  '2312510023',
  'turjamahmud4@gmail.com',
  'English',
  '1324865002',
  NULL,
  NULL,
  'cash',
  NULL,
  'https://drive.google.com/file/d/1YWAlNGalfacv0zG0mXcCz3obzRBqGRRC/view?usp=drivesdk',
  '2025-11-16T06:56:24.760Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Afnan Sameer Prince',
  'Fall 25',
  '112510012',
  'aprince2510012@bscse.uiu.ac.bd',
  'Computer Science & Engineering',
  '1830679666',
  NULL,
  NULL,
  'cash',
  NULL,
  NULL,
  '2025-11-16T06:57:30.319Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Sumaiya Jafrin Orthi',
  'Fall 25',
  '2312510012',
  'jafrinorthi31@gmail.com',
  'English',
  '1973610275',
  NULL,
  NULL,
  'cash',
  NULL,
  NULL,
  '2025-11-16T07:00:41.229Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Farhad Uddin Ahmed Adro',
  'Fall 25',
  '1112510075',
  'fadro2510075@bba.uiu.ac.bd',
  'Business Administration',
  '1318030829',
  NULL,
  NULL,
  'cash',
  NULL,
  'https://drive.google.com/file/d/1B2TOGERwEbhJxDdqSXUEWTyyqERbGaTo/view?usp=drivesdk',
  '2025-11-16T08:11:13.123Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Sanjida Islam maisha',
  'Fall 25',
  '1212510007',
  'smaisha2510007@bseco.uiu.ac.bd',
  'Economics',
  '1872068065',
  NULL,
  NULL,
  'cash',
  NULL,
  'https://drive.google.com/file/d/1iNQ7hh6mwjXs0eV-M0k9LukhZFVgjBwf/view?usp=drivesdk',
  '2025-11-16T08:12:06.009Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Samiha Zaman Raisha',
  'Fall 25',
  '2212510014',
  'sraisha2510014@bssmsj.uiu.ac.bd',
  'MSJ',
  '1935059668',
  NULL,
  NULL,
  'cash',
  NULL,
  NULL,
  '2025-11-16T08:16:02.825Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Meherun Nesa Joya',
  'Fall 25',
  '152410051',
  'mjoya2410051@bsds.uiu.ac.bd',
  'Data Science',
  '1300737936',
  NULL,
  NULL,
  'bkash',
  NULL,
  'https://drive.google.com/file/d/1kgSAzG1e_2AtZLeQizp3JixDfU8OWDso/view?usp=drivesdk',
  '2025-11-16T17:28:56.605Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Kazi Anik Ahmed',
  'Fall 25',
  '152530019',
  'kahmed2530019@bsds.uiu.ac.bd',
  'Data Science',
  '1997623755',
  NULL,
  NULL,
  'cash',
  NULL,
  'https://drive.google.com/file/d/1c8IKy_oGIAVOYuu5E4Oh0Hn_JeNubSlG/view?usp=drivesdk',
  '2025-11-22T07:40:08.224Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Kasfiya Ahsan',
  'Fall 25',
  '2312530011',
  'kahsan2530011@baeng.uiu.ac.bd',
  'English',
  '01959-318781',
  NULL,
  NULL,
  'online',
  'CKM3FM2XUB',
  'https://drive.google.com/file/d/1QE2WAPaWBzpmfteOnx8j6MkHHbw8jHDg/view?usp=drivesdk',
  '2025-11-22T14:55:45.023Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Sadman Saleh',
  'Fall 25',
  '152520028',
  'sadmansaleh50@gmail.com',
  'Data Science',
  '1710110377',
  NULL,
  'https://www.facebook.com/sadman.saleh.106',
  'online',
  'CKL4EFCYA4',
  'https://drive.google.com/file/d/1aqvVO9SziQmkl2u5ofIQOLEzMTzox-hQ/view?usp=drivesdk',
  '2025-11-24T10:49:30.937Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Rafeul Islam Mehim',
  'Fall 25',
  '112520068',
  'rafeulislam420666@gmail.com',
  'Computer Science & Engineering',
  '1771111635',
  NULL,
  'https://www.facebook.com/rafeulislam.mehim.5',
  'cash',
  NULL,
  NULL,
  '2025-11-24T17:09:23.251Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Ayesha Akter Anika',
  'Fall 25',
  '2312510013',
  'aanika2510013@baeng.uiu.ac.bd',
  'English',
  '1839106598',
  NULL,
  'https://www.facebook.com/ayesha.anika.247929',
  'cash',
  NULL,
  NULL,
  '2025-11-25T07:13:46.897Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Fahim Ahammed',
  'Spring 26',
  '3212530022',
  'fahimahammed858@gmail.com',
  'Others',
  '1893085586',
  NULL,
  'https://www.facebook.com/share/1DCYWmwe17/',
  'online',
  'DC25LHSTZ5',
  'https://drive.google.com/file/d/1D6WTe6TVWlgKfxCbMbU9-16rAi7-6B8e/view?usp=drivesdk',
  '2026-03-01T19:32:53.041Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Wahiduzzaman Kayes',
  'Spring 26',
  '112610111',
  'wahiduzzamankayes123@gmail.com',
  'Computer Science & Engineering',
  '1540165423',
  NULL,
  'https://www.facebook.com/share/1NS7iqZEai/',
  'online',
  'DC34MMZJDI',
  'https://drive.google.com/file/d/1axIA2TK2WJHasMBPq_-GJud4DaVi8niK/view?usp=drivesdk',
  '2026-03-02T18:42:17.184Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Md Bayzid Hasan',
  'Spring 26',
  '1142420008',
  'mhasan2420008@bba-ais.uiu.ac.bd',
  'BBA in AIS',
  '1858402688',
  NULL,
  'https://www.facebook.com/share/18N1YLsE5n/',
  'online',
  'DC30MVC2PI',
  NULL,
  '2026-03-03T04:33:47.759Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Nusaiba Tarannum',
  'Spring 26',
  '1112610062',
  'tarannumnusaiba23@gmail.com',
  'BBA',
  '1784413361',
  NULL,
  'https://www.facebook.com/share/1CGFsAzis5/',
  'cash',
  NULL,
  NULL,
  now()
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Naria Noorjahan',
  'Spring 26',
  '3112610041',
  'ramishanoorjahan@gmail.com',
  'Pharmacy',
  '1919885353',
  NULL,
  'https://www.facebook.com/narianoorjahan?mibextid=wwXIfr&mibextid=wwXIfr',
  'cash',
  NULL,
  'https://drive.google.com/file/d/1CiIc9LJ7xsqGJsXiiAXXpjQ-XrL7_HF9/view?usp=drivesdk',
  '2026-03-03T06:41:36.942Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Shahazadi Ablin Limu',
  'Spring 26',
  '3112610048',
  'shahazadiablinlimu76@gmail.com',
  'Pharmacy',
  '1321195520',
  NULL,
  'https://www.facebook.com/share/1D1GUEfzSi/',
  'cash',
  NULL,
  'https://drive.google.com/file/d/1tfXN7eWeF7oSj2c2r08VctokEi38jPYr/view?usp=drivesdk',
  '2026-03-03T06:42:17.285Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Nishat Tasnim',
  'Spring 26',
  '2212610003',
  'ntasnim2610003@bssmsj.uiu.ac.bd',
  'MSJ',
  '1312894807',
  NULL,
  'https://www.facebook.com/share/1AJBrjFt9w/',
  'cash',
  NULL,
  NULL,
  '2026-03-03T06:48:26.100Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Nishat Tasnim',
  'Spring 26',
  '2212610003',
  'ntasnim2610003@bssmsj.uiu.ac.bd',
  'MSJ',
  '1312894807',
  NULL,
  'https://www.facebook.com/share/1AJBrjFt9w/',
  'cash',
  NULL,
  NULL,
  '2026-03-03T06:48:29.447Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Silvia Alam',
  'Spring 26',
  '1112510013',
  'salam2510013@bba.uiu.ac.bd',
  'BBA',
  '1570229412',
  NULL,
  'https://www.facebook.com/share/1BFgzjkVuD/',
  'cash',
  NULL,
  NULL,
  '2026-03-04T05:17:58.705Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Miftahul Islam',
  'Spring 26',
  '1112610071',
  'mislam2610071@bba.uiu.ac.bd',
  'BBA',
  '1795319199',
  NULL,
  'https://www.facebook.com/share/18FH4cSkvk/',
  'cash',
  NULL,
  'https://drive.google.com/file/d/1Kaa-p4hGApu5I9BIYGMnx7ZrgqCcuP7p/view?usp=drivesdk',
  '2026-03-04T05:32:13.497Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Najbin Nahar Almo',
  'Spring 26',
  '112610186',
  'nalmo2610186@bscse.uiu.ac.bd',
  'Computer Science & Engineering',
  '1974547869',
  NULL,
  'https://www.facebook.com/share/1BYKx4ddEu/',
  'cash',
  NULL,
  NULL,
  '2026-03-04T05:33:52.329Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Argha Ghosh',
  'Spring 26',
  '112530189',
  'aghosh2530189@bscse.uiu.ac.bd',
  'Computer Science & Engineering',
  '1842421216',
  NULL,
  'https://www.facebook.com/share/1AnVrBoarQ/',
  'online',
  'DC42O5S33Y',
  'https://drive.google.com/file/d/1ash1NKuVlKwkqTtrDk_zYGahKOWtOwfY/view?usp=drivesdk',
  '2026-03-04T05:44:10.981Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Nayem Hossain Olid',
  'Spring 26',
  '212610019',
  'nolid2610019@bseee.uiu.ac.bd',
  'Electrical & Electronic Engineering',
  '1402486096',
  NULL,
  'https://www.facebook.com/share/18NpqtxzC7/',
  'cash',
  NULL,
  NULL,
  '2026-03-04T05:51:42.247Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Al Shahid Ahammed Meraz',
  'Spring 26',
  '212530014',
  'ameraz2530014@bseee.uiu.ac.bd',
  'Electrical & Electronic Engineering',
  '1930703350',
  NULL,
  'https://www.facebook.com/I.am.al.shahid',
  'online',
  'DC44O5YVCI',
  'https://drive.google.com/file/d/1HhUrQnGAZhlPO37TeWfCGtoArFovdxZG/view?usp=drivesdk',
  '2026-03-04T05:57:36.026Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Md.Shariful Islam Leon',
  'Spring 26',
  '112410341',
  'mleon2410341@bscse.uiu.ac.bd',
  'Computer Science & Engineering',
  '1936863701',
  NULL,
  'https://www.facebook.com/hlwbro0?mibextid=wwXIfr&mibextid=wwXIfr',
  'online',
  'DC44O7MOPCMR',
  NULL,
  '2026-03-04T06:23:12.856Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Akib Mehedi',
  'Spring 26',
  '112330681',
  'akibmehedi666@gmail.com',
  'Computer Science & Engineering',
  '1531970830',
  NULL,
  'https://www.facebook.com/share/1DhB8fGfEW/',
  'cash',
  NULL,
  NULL,
  '2026-03-04T06:54:31.319Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Tanvirul Islam',
  'Spring 26',
  '112520266',
  'tislam2520266@gmail.con',
  'Computer Science & Engineering',
  '1521785698',
  NULL,
  'https://www.facebook.com/share/175SMLAELJ/?mibextid=wwXIfr',
  'cash',
  NULL,
  'https://drive.google.com/file/d/1LzC3M5ToeAuXbtI8y8ZgvVfx7oIEli7Z/view?usp=drivesdk',
  '2026-03-04T07:50:15.184Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Maisha Mobashira',
  'Spring 26',
  '112530138',
  'mmobashira2530138@bscse.uiu.ac.bd',
  'Computer Science & Engineering',
  '1812339307',
  NULL,
  'https://www.facebook.com/share/1B6v5ubTeR/',
  'cash',
  NULL,
  NULL,
  '2026-03-04T07:53:10.392Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Md.Ziadul Amin',
  'Spring 26',
  '212530009',
  'mamin2530009@bseee.uiu.ac.bd',
  'Electrical & Electronic Engineering',
  '1602958514',
  NULL,
  'https://www.facebook.com/share/19mgkQ1h5g/',
  'online',
  'DC47OBK8MH',
  'https://drive.google.com/file/d/1EtADjhaJNY_ARTvLMOPA5coJLxQjehT0/view?usp=drivesdk',
  '2026-03-04T08:48:21.054Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Tanzim Tahamed Khan',
  'Spring 26',
  '112331146',
  'tkhan2331146@bscse.uiu.ac.bd',
  'Computer Science & Engineering',
  '1611228135',
  NULL,
  'https://www.facebook.com/share/1ESUnNwQLK/',
  'online',
  'DC43OE18S3',
  'https://drive.google.com/file/d/1tiJ6jLbpEy12Y42A5aeX5oCGp4ti69KP/view?usp=drivesdk',
  '2026-03-04T08:58:49.610Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Naymul Hasan Nahid',
  'Spring 26',
  '152610019',
  'nnahid2610019@bsds.uiu.ac.bd',
  'Data Science',
  '1608930216',
  NULL,
  'https://www.facebook.com/share/1BTcDSXKUw/?mibextid=wwXIfr',
  'cash',
  NULL,
  NULL,
  '2026-03-04T09:18:38.042Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Mahmudul Hasan Mahi',
  'Spring 26',
  '112610049',
  'mmahi2610049@bscse.uiu.ac.bd',
  'Computer Science & Engineering',
  '1841878793',
  NULL,
  'https://www.facebook.com/share/1EQuXPGncd/',
  'cash',
  NULL,
  NULL,
  '2026-03-04T09:21:07.148Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Stanly Jason Baroi',
  'Spring 26',
  '112610152',
  'sbaroi2610152@gmail.com',
  'Computer Science & Engineering',
  '1533969401',
  NULL,
  'https://www.facebook.com/share/1HsUQiwjXF/',
  'cash',
  NULL,
  'https://drive.google.com/file/d/1VO3jhejgcffKMy7Xn9IyAwZ7d2TQfwim/view?usp=drivesdk',
  '2026-03-04T09:39:21.881Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Md Juel Miah',
  'Spring 26',
  '112520082',
  'mmiah2520082@bscse.uiu.ac.bd',
  'Computer Science & Engineering',
  '1732842102',
  NULL,
  'https://www.facebook.com/share/18FNEtv97U/?mibextid=wwXIfr',
  'cash',
  NULL,
  'https://drive.google.com/file/d/16Id8HMb44AsMEEUV54Qf-PGZ-Gk0493s/view?usp=drivesdk',
  '2026-03-04T09:42:21.192Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Md. Tasin',
  'Spring 26',
  '152520027',
  'abdullah.tasin.100@gmail.com',
  'Data Science',
  '1306591898',
  NULL,
  'https://www.facebook.com/share/18HH18CkMa/',
  'online',
  'DC48O2WQI6',
  'https://drive.google.com/file/d/1FSonZ7XBDYn6gFvqHr-8VgK4Ssk06m5v/view?usp=drivesdk',
  '2026-03-04T15:05:21.609Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Tasnuma Tabassum Nammi',
  'Spring 26',
  '2312510007',
  'tnammi2510007@baeng.uiu.ac.bd',
  'English',
  '1344031167',
  NULL,
  'https://www.facebook.com/share/1BXnKcaWTM/',
  'cash',
  NULL,
  'https://drive.google.com/file/d/12SeZ5rNZSs4uQkX1Ih4vl3HsoFvxL3sE/view?usp=drivesdk',
  '2026-03-07T07:47:00.794Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Sidratul Muntaha',
  'Spring 26',
  '3212510043',
  'smuntaha2510043@bsbge.uiu.ac.bd',
  'Others',
  '171251010',
  NULL,
  'https://www.facebook.com/share/187yfJvo6b/?mibextid=wwXIfr',
  'cash',
  NULL,
  'https://drive.google.com/file/d/1KUSxvckjjh4mCKTcYnpu4mj_ga-Nj58W/view?usp=drivesdk',
  '2026-03-08T05:43:37.771Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Rehenuma Binta Sazzad',
  'Spring 26',
  '1112520053',
  'rsazzad2520053@bba.uiu.ac.bd',
  'BBA',
  '1795131359',
  NULL,
  'https://www.facebook.com/share/18KNNhHvUk/',
  'online',
  'DC81TX2TB7',
  'https://drive.google.com/file/d/1ZPcLqugqDwSOYTuQI5FMwqynIW7vwOX9/view?usp=drivesdk',
  '2026-03-08T16:50:33.111Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Maruf Ur Rahman',
  'Spring 26',
  '112610066',
  'marufkhan.officials.bd@gmail.com',
  'Computer Science & Engineering',
  '8801830237376',
  NULL,
  'https://www.facebook.com/share/18FGnAiR5J/',
  'online',
  'Junayed',
  NULL,
  '2026-04-05T06:54:40.753Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Raisa Lamia',
  'Spring 26',
  '3112610021',
  'rlamia2610021@bpharm.uiu.ac.bd',
  'Pharmacy',
  '1784775327',
  NULL,
  'https://www.facebook.com/share/18Pyu7WRN8/',
  'online',
  'Junayed',
  'https://drive.google.com/file/d/1VrkLAlomCIPnUTk6Q_yAOJTGE99W1vzC/view?usp=drivesdk',
  '2026-04-05T06:54:36.169Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Rakin Absar Kabir',
  'Spring 26',
  '1112610016',
  'rakinabsar81@gmail.com',
  'BBA',
  '1805518729',
  NULL,
  'https://www.facebook.com/share/1Hf7M8Yx4L/?mibextid=wwXIfr',
  'cash',
  NULL,
  NULL,
  '2026-04-05T07:33:57.306Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'MD. JIHAD KHAN',
  'Spring 26',
  '1112610060',
  'zihad.khan.zcx@gmail.com',
  'BBA',
  '1730278750',
  NULL,
  'https://www.facebook.com/share/1TNURaYzjW/?mibextid=wwXIfr',
  'cash',
  NULL,
  NULL,
  '2026-04-05T07:34:04.930Z'
);

INSERT INTO members (full_name, session, student_id, email, department, phone, blood_group, facebook_link, payment_method, transaction_id, photo_url, created_at) VALUES (
  'Kazi Arham Ullah',
  'Spring 26',
  '212610005',
  'kaziarhamullah96@gmail.com',
  'Electrical & Electronic Engineering',
  '1313737121',
  NULL,
  'https://www.facebook.com/share/1Dk6wAFR5r/',
  'online',
  'DDA026QPW4',
  'https://drive.google.com/file/d/1zQRmQZTlzjW18KnrInTLTQjvyf5cB-H9/view?usp=drivesdk',
  '2026-04-10T18:08:12.665Z'
);

-- ============================================================
-- COMMITTEE MIGRATION (61 total across all years)
-- ============================================================

-- Current Committee: 2025-2026 (30 members)

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Ahmad Hasan',
  'President',
  'Computer Science & Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1769887594/Ahmad_c9unik.jpg',
  '2025-2026',
  1,
  '{}',
  true
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Md Zobaer Ahmed',
  'Vice President',
  'Computer Science & Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1769887572/Zobayer_wb181f.jpg',
  '2025-2026',
  2,
  '{}',
  true
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Anika Anjum Mona',
  'General Secretary',
  'Environment and Development Studies',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1769887676/Mona_kyuquj.jpg',
  '2025-2026',
  3,
  '{}',
  true
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Dipto Mahdud Sultan',
  'Assistant General Secretary',
  'Department of MSJ',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1769887627/Dipto_jtswqk.jpg',
  '2025-2026',
  4,
  '{}',
  true
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Jonayed Shah Jesun',
  'Treasurer',
  'Computer Science & Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1769887573/Zonayed_ud4jkj.jpg',
  '2025-2026',
  5,
  '{}',
  true
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Zannatul Amin',
  'Head of PR',
  'Deptartment of BBA',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1769887619/Amin_dcyrw0.jpg',
  '2025-2026',
  6,
  '{}',
  true
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Jahid Hasan Sabbir',
  'Asst. Head of PR',
  'Computer Science & Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1769887631/Sabbir_yhyqkl.jpg',
  '2025-2026',
  7,
  '{}',
  true
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Tahsin Moin Rhythm',
  'Asst. Head of PR',
  'Department of Data Science',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1769887565/Tahsin_ff8qxm.jpg',
  '2025-2026',
  8,
  '{}',
  true
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Minhaz Hossain Shemul',
  'Head of ORG',
  'Electrical & Electronic Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1769887598/Shemul_qmlobd.jpg',
  '2025-2026',
  9,
  '{}',
  true
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Md Arean Nobi Kanok',
  'Asst. Head of Org',
  'Computer Science & Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1769887598/Arean_visqqz.jpg',
  '2025-2026',
  10,
  '{}',
  true
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Md. Eakub Ali',
  'Asst. Head of Org',
  'Electrical & Electronic Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1769887703/Hridoy_m4eczj.jpg',
  '2025-2026',
  11,
  '{}',
  true
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Mayesha Tun Nur',
  'Head of Event',
  'Computer Science & Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1769887645/Mayesha_sa4vl0.jpg',
  '2025-2026',
  12,
  '{}',
  true
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Tanzim Hasan',
  'Asst. Head of Event',
  'Computer Science & Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1769887576/Tanzim_v8kli1.jpg',
  '2025-2026',
  13,
  '{}',
  true
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Abdullah R Rafi',
  'Asst. Head of Event',
  'Computer Science & Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1769887531/Rafi_w0x154.png',
  '2025-2026',
  14,
  '{}',
  true
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Faiaz Nibir',
  'Asst. Head of Event',
  'Computer Science & Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1769887694/Nibir_cqx3ux.jpg',
  '2025-2026',
  15,
  '{}',
  true
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Pratoy Barua',
  'Head of HR',
  'Computer Science & Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1769887646/Pratoy_bmibzy.jpg',
  '2025-2026',
  16,
  '{}',
  true
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Mahin Muntasin Rahul',
  'Asst. Head of HR',
  'Environment and Development Studies',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1769887812/Mahin_rapoj1.jpg',
  '2025-2026',
  17,
  '{}',
  true
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Fahmid Khan',
  'Asst. Head of HR',
  'Computer Science & Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1769887557/Fahmid_s7rusd.jpg',
  '2025-2026',
  18,
  '{}',
  true
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Md Fardin Jany',
  'Designer',
  'Computer Science & Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1769887621/Raad_qbh9a5.jpg',
  '2025-2026',
  19,
  '{}',
  true
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Md Abdul Aziz Arafat',
  'Designer',
  'Computer Science & Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1769887605/Aziz_qg8gdf.jpg',
  '2025-2026',
  20,
  '{}',
  true
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Yeasin Arafat Babu',
  'Executive Member',
  'Biotechnology & Genetic Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1769887534/Babu_hkqvqq.png',
  '2025-2026',
  21,
  '{}',
  true
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'S.M. Atik Hasan',
  'Executive Member',
  'Computer Science & Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1769887589/Atik_fllgz4.jpg',
  '2025-2026',
  22,
  '{}',
  true
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Tanzin Tuli',
  'Executive Member',
  'Department of BBA',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1769887531/Tuli_lvjeze.png',
  '2025-2026',
  23,
  '{}',
  true
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Murad Hasan',
  'Executive Member',
  'Computer Science & Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1769887650/Million_aoejlh.jpg',
  '2025-2026',
  24,
  '{}',
  true
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Ameenah Binte Mahbub',
  'Executive Member',
  'Electrical & Electronic Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1769887608/Ameenah_hnlcps.jpg',
  '2025-2026',
  25,
  '{}',
  true
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Sadman Saleh',
  'Executive Member',
  'Department of Data Science',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1769887678/Sadman_nbyxrk.jpg',
  '2025-2026',
  26,
  '{}',
  true
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Sadika Salam',
  'Executive Member',
  'Department of BBA',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1769887549/Sadika_ngr4cp.jpg',
  '2025-2026',
  27,
  '{}',
  true
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Nusrat Subha',
  'Executive Member',
  'Department of Pharmacy',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1769887705/Nusrat_n4bm8q.jpg',
  '2025-2026',
  28,
  '{}',
  true
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Siam Arefin',
  'Executive Member',
  'Department of Data Science',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1769887684/Siam_xghr6a.jpg',
  '2025-2026',
  29,
  '{}',
  true
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Faysal Bin Ibrahim',
  'Executive Member',
  'Computer Science & Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1769887671/Faysal_s00gko.jpg',
  '2025-2026',
  30,
  '{}',
  true
);

-- Historical Committee: 2023 (22 members)

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Pulok Sikdar',
  'President',
  'Computer Science & Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983041/pulok_fotumj.jpg',
  '2023',
  1,
  '{}',
  false
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Nafis Nawal',
  'Vice President',
  'Computer Science & Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983045/nafis_fslsiw.jpg',
  '2023',
  2,
  '{}',
  false
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Md Mahmudul Hasan',
  'General Secretary',
  'Computer Science & Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983042/hasan_p7zfgk.jpg',
  '2023',
  3,
  '{}',
  false
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Ahmad Hasan',
  'Asst. General Secretary',
  'Computer Science & Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983042/ahmad_enzaam.jpg',
  '2023',
  4,
  '{}',
  false
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Muhit Khan',
  'Treasurer',
  'Computer Science & Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983045/muhit_pvc0bx.jpg',
  '2023',
  5,
  '{}',
  false
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Anika Anjum Mona',
  'Asst. Treasurer',
  'Environment and Development Studies',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983044/mona_y54t2k.jpg',
  '2023',
  6,
  '{}',
  false
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Ishrak Ahmed',
  'Head of Design',
  'Computer Science & Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983043/ishrak_yyw6tr.jpg',
  '2023',
  7,
  '{}',
  false
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Md Reza',
  'Head of Org.',
  'Computer Science & Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983043/reza_raexvo.jpg',
  '2023',
  8,
  '{}',
  false
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Abdul Mohsen Rubay',
  'Head of PR',
  'Computer Science & Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1761984293/rubay_tdrwo8.jpg',
  '2023',
  9,
  '{}',
  false
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Md Zobaer Ahmed',
  'Head of HR',
  'Computer Science & Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983045/zobayer_rztaox.jpg',
  '2023',
  10,
  '{}',
  false
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Dipto Mahdud Sultan',
  'Head of Event',
  'Department of MSJ',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983041/dipto_yxckvv.jpg',
  '2023',
  11,
  '{}',
  false
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Tahsin Topu',
  'Asst. Head of ORG',
  'Computer Science & Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983046/topu_g4zpf6.jpg',
  '2023',
  12,
  '{}',
  false
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Tanvir Ahmed',
  'Asst. Head of ORG',
  'Computer Science & Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983044/tanvir_cuzdid.jpg',
  '2023',
  13,
  '{}',
  false
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Jonayed',
  'Designer',
  'Computer Science & Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983043/Jonayed_ozbke5.jpg',
  '2023',
  14,
  '{}',
  false
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Siddiquee Shuaib',
  'Asst. Head of PR',
  'Electrical & Electronic Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983044/shuaib_yripkq.jpg',
  '2023',
  15,
  '{}',
  false
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Ishrak Farhan',
  'Asst. Head of HR',
  'Computer Science & Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983043/farhan_z4d9el.jpg',
  '2023',
  16,
  '{}',
  false
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Rifat Hassan Rabib',
  'Asst. Head of HR',
  'Computer Science & Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983041/rabib_dzpawf.jpg',
  '2023',
  17,
  '{}',
  false
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Minhaz Hossain Shemul',
  'Executives',
  'Electrical & Electronic Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983044/shemul_o2n1am.jpg',
  '2023',
  18,
  '{}',
  false
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Mayesha Nur',
  'Executives',
  'Computer Science & Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983044/maisha_eawkws.jpg',
  '2023',
  19,
  '{}',
  false
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Jahid Hasan Sabbir',
  'Executives',
  'Computer Science & Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983043/sabbir_tdtnke.jpg',
  '2023',
  20,
  '{}',
  false
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Zannatul Amin',
  'Executives',
  'Computer Science & Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983042/anika_anssy2.jpg',
  '2023',
  21,
  '{}',
  false
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Arean Nobi',
  'Executives',
  'Computer Science & Engineering',
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983041/arean_ubnwpt.jpg',
  '2023',
  22,
  '{}',
  false
);

-- Historical Committee: 2022 (4 members)

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Arif Mahmud',
  'President',
  NULL,
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1762807808/arifPC22_n4oa2o.jpg',
  '2022',
  1,
  '{}',
  false
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Mirza Muyammar Munnaf hussain Baig',
  'General Secretary',
  NULL,
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1762807808/munnafPC22_ugukeg.jpg',
  '2022',
  2,
  '{}',
  false
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Rabius Sany Jabiullah',
  'Treasurer',
  NULL,
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=800&fit=crop',
  '2022',
  3,
  '{}',
  false
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Adib Mahmud',
  'Asst. Treasurer',
  NULL,
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1762808128/adibPC22_qpwopz.jpg',
  '2022',
  4,
  '{}',
  false
);

-- Historical Committee: 2019 (5 members)

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Saikat Kumar Saha',
  'President',
  NULL,
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1762808335/saikatPC19_hmpdkx.jpg',
  '2019',
  1,
  '{}',
  false
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'M Shamim Reza',
  'General Secretary',
  NULL,
  'https://res.cloudinary.com/do0e8p5d2/image/upload/v1762808402/shamimPC19_eoi3oq.jpg',
  '2019',
  2,
  '{}',
  false
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'S. M. Abu Hena',
  'Asst. General Secretary',
  NULL,
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=800&fit=crop',
  '2019',
  3,
  '{}',
  false
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Mohiuzzaman',
  'Treasurer',
  NULL,
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=800&fit=crop',
  '2019',
  4,
  '{}',
  false
);

INSERT INTO committees (member_name, designation, department, image_url, year, order_index, social_links, is_current) VALUES (
  'Sadia Islam',
  'Asst. Treasurer',
  NULL,
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=800&fit=crop',
  '2019',
  5,
  '{}',
  false
);

-- ============================================================
-- ACHIEVEMENTS MIGRATION (4 records)
-- ============================================================

INSERT INTO achievements (title, description, year, image_url, tags) VALUES (
  'National Photography Exhibition: Gold Medal',
  'UIUPC secured the top honor at the Grand National Photo Summit for ''Excellence in Visual Storytelling'', competing against 50+ regional clubs.',
  '2025',
  '/images/achievements/gold-medal.png',
  ARRAY['Awards', 'Recognition']::TEXT[]
);

INSERT INTO achievements (title, description, year, image_url, tags) VALUES (
  'Best University Club of the Year',
  'Awarded by the Student Affairs Directorate for consistent contribution to campus culture through workshops, exhibitions, and professional coverage.',
  '2024',
  '/images/achievements/best-club.png',
  ARRAY['Legacy', 'University']::TEXT[]
);

INSERT INTO achievements (title, description, year, image_url, tags) VALUES (
  'International Collaboration: Global Frames',
  'Hosted a cross-border virtual exhibition with photographers from 5 countries, fostering a global dialogue on documentary photography and heritage.',
  '2023',
  '/images/achievements/global-frames.png',
  ARRAY['Global', 'Exhibition']::TEXT[]
);

INSERT INTO achievements (title, description, year, image_url, tags) VALUES (
  'Visual Literacy Initiative Launch',
  'Successfully trained over 500 students in foundational photography through our community-led peer mentorship program, defining the club''s educational mission.',
  '2022',
  '/images/achievements/mentorship.png',
  ARRAY['Education', 'Impact']::TEXT[]
);

COMMIT;
