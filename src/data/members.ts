export interface HistoricalMember {
  id: string | number;
  name: string;
  role: string;
  department?: string;
  profileImage?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  tag: string; // Added to match current organizational standard
}

export interface CommitteeYear {
  year: string;
  members: HistoricalMember[];
}

export const PREVIOUS_COMMITTEES: CommitteeYear[] = [
  {
    year: "2023",
    members: [
      {
        id: "23-1",
        name: "Pulok Sikdar",
        role: "President",
        tag: "Core",
        department: "Computer Science & Engineering",
        profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983041/pulok_fotumj.jpg",
      },
      {
        id: "23-2",
        name: "Nafis Nawal",
        role: "Vice President",
        tag: "Core",
        department: "Computer Science & Engineering",
        profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983045/nafis_fslsiw.jpg",
      },
      {
        id: "23-3",
        name: "Md Mahmudul Hasan",
        role: "General Secretary",
        tag: "Core",
        department: "Computer Science & Engineering",
        profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983042/hasan_p7zfgk.jpg",
      },
      {
        id: "23-4",
        name: "Ahmad Hasan",
        role: "Asst. General Secretary",
        tag: "Core",
        department: "Computer Science & Engineering",
        profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983042/ahmad_enzaam.jpg",
      },
      {
        id: "23-5",
        name: "Muhit Khan",
        role: "Treasurer",
        tag: "Core",
        department: "Computer Science & Engineering",
        profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983045/muhit_pvc0bx.jpg",
      },
      {
        id: "23-6",
        name: "Anika Anjum Mona",
        role: "Asst. Treasurer",
        tag: "Core",
        department: "Environment and Development Studies",
        profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983044/mona_y54t2k.jpg",
      },
      {
        id: "23-7",
        name: "Ishrak Ahmed",
        tag: "Design",
        department: "Computer Science & Engineering",
        profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983043/ishrak_yyw6tr.jpg",
        role: "Head of Design",
      },
      {
        id: "23-8",
        name: "Md Reza",
        tag: "Organizers",
        department: "Computer Science & Engineering",
        profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983043/reza_raexvo.jpg",
        role: "Head of Org.",
      },
      {
        id: "23-9",
        name: "Abdul Mohsen Rubay",
        tag: "Public Relations",
        department: "Computer Science & Engineering",
        profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761984293/rubay_tdrwo8.jpg",
        role: "Head of PR",
      },
      {
        id: "23-10",
        name: "Md Zobaer Ahmed",
        tag: "Human Resources",
        department: "Computer Science & Engineering",
        profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983045/zobayer_rztaox.jpg",
        role: "Head of HR",
      },
      {
        id: "23-11",
        name: "Dipto Mahdud Sultan",
        tag: "Event",
        department: "Department of MSJ",
        profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983041/dipto_yxckvv.jpg",
        role: "Head of Event",
      },
      {
        id: "23-12",
        name: "Tahsin Topu",
        tag: "Organizers",
        department: "Computer Science & Engineering",
        profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983046/topu_g4zpf6.jpg",
        role: "Asst. Head of ORG",
      },
      {
        id: "23-13",
        name: "Tanvir Ahmed",
        tag: "Organizers",
        department: "Computer Science & Engineering",
        profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983044/tanvir_cuzdid.jpg",
        role: "Asst. Head of ORG",
      },
      {
        id: "23-14",
        name: "Jonayed",
        tag: "Design",
        department: "Computer Science & Engineering",
        profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983043/Jonayed_ozbke5.jpg",
        role: "Designer",
      },
      {
        id: "23-15",
        name: "Siddiquee Shuaib",
        tag: "Public Relations",
        department: "Electrical & Electronic Engineering",
        profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983044/shuaib_yripkq.jpg",
        role: "Asst. Head of PR",
      },
      {
        id: "23-16",
        name: "Ishrak Farhan",
        tag: "Human Resources",
        department: "Computer Science & Engineering",
        profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983043/farhan_z4d9el.jpg",
        role: "Asst. Head of HR",
      },
      {
        id: "23-17",
        name: "Rifat Hassan Rabib",
        tag: "Human Resources",
        department: "Computer Science & Engineering",
        profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983041/rabib_dzpawf.jpg",
        role: "Asst. Head of HR",
      },
      {
        id: "23-18",
        name: "Minhaz Hossain Shemul",
        tag: "Executives",
        department: "Electrical & Electronic Engineering",
        profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983044/shemul_o2n1am.jpg",
        role: "Executives",
      },
      {
        id: "23-19",
        name: "Mayesha Nur",
        tag: "Executives",
        department: "Computer Science & Engineering",
        profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983044/maisha_eawkws.jpg",
        role: "Executives",
      },
      {
        id: "23-20",
        name: "Jahid Hasan Sabbir",
        tag: "Executives",
        department: "Computer Science & Engineering",
        profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983043/sabbir_tdtnke.jpg",
        role: "Executives",
      },
      {
        id: "23-21",
        name: "Zannatul Amin",
        tag: "Executives",
        department: "Computer Science & Engineering",
        profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983042/anika_anssy2.jpg",
        role: "Executives",
      },
      {
        id: "23-22",
        name: "Arean Nobi",
        tag: "Executives",
        department: "Computer Science & Engineering",
        profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1761983041/arean_ubnwpt.jpg",
        role: "Executives",
      },
    ]
  },
  {
    year: "2022",
    members: [
      {
        id: "22-1",
        name: "Arif Mahmud",
        role: "President",
        tag: "Core",
        profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1762807808/arifPC22_n4oa2o.jpg",
      },
      {
        id: "22-2",
        name: "Mirza Muyammar Munnaf hussain Baig",
        role: "General Secretary",
        tag: "Core",
        profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1762807808/munnafPC22_ugukeg.jpg",
      },
      {
        id: "22-3",
        name: "Rabius Sany Jabiullah",
        role: "Treasurer",
        tag: "Core",
        profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=800&fit=crop",
      },
      {
        id: "22-4",
        name: "Adib Mahmud",
        role: "Asst. Treasurer",
        tag: "Core",
        profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1762808128/adibPC22_qpwopz.jpg",
      },
    ]
  },
  {
    year: "2019",
    members: [
      {
        id: "19-1",
        name: "Saikat Kumar Saha",
        role: "President",
        tag: "Core",
        profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1762808335/saikatPC19_hmpdkx.jpg",
      },
      {
        id: "19-2",
        name: "M Shamim Reza",
        role: "General Secretary",
        tag: "Core",
        profileImage: "https://res.cloudinary.com/do0e8p5d2/image/upload/v1762808402/shamimPC19_eoi3oq.jpg",
      },
      {
        id: "19-3",
        name: "S. M. Abu Hena",
        role: "Asst. General Secretary",
        tag: "Core",
        profileImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=800&fit=crop",
      },
      {
        id: "19-4",
        name: "Mohiuzzaman",
        role: "Treasurer",
        tag: "Core",
        profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&h=800&fit=crop",
      },
      {
        id: "19-5",
        name: "Sadia Islam",
        role: "Asst. Treasurer",
        tag: "Core",
        profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&h=800&fit=crop",
      },
    ]
  }
];
