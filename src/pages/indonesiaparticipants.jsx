import { Inter } from "next/font/google";
import { useState, useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

function IndoensiaParticipants() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [price, setPrice] = useState("");
  const [paymentUrl, setPaymentUrl] = useState("");
  const [uniqueId, setUniqueId] = useState(""); // Mengatur uniqueId ke state
  const [selectedNamaLengkap, setSelectedNamaLengkap] = useState("");
  const [selectEmailKetua, setselectEmailKetua] = useState("") // Menambah state untuk Email Ketua team
  const [phone, setPhone] = useState(""); // Menambah state untuk phone (Nomor WhatsApp)
  const [selectNameSupervisor, setselectNameSupervisor] = useState("") // Menambah state untuk Name Supervisor team
  const [selectPhoneSupervisor, setSelectPhoneSupervisor] = useState(""); // Menambah state untuk phone (Nomor WhatsApp)
  const [selectEmailSupervisor, setselectEmailSupervisor] = useState("") // Menambah state untuk Email Supervisor team
  const adminFee = 4500; // Biaya admin tetap

  const generateUniqueId = () => {
    const timestamp = new Date().getTime();
    return `NYMO${timestamp}`;
  };

  const generateFormData = (
    selectedCategory,
    price,
    uniqueId,
    selectedNamaLengkap,
    phone
  ) => {
    const formattedPrice = Math.max(Math.floor(price), 1);
    const totalPrice = formattedPrice + adminFee;

    // Memecah nama lengkap menjadi array berdasarkan baris
    const names = selectedNamaLengkap.split("\n");

    // Mengambil nama pertama sebagai Nama Ketua
    const ketua = names.length > 0 ? names[0] : "";

    return {
      item_details: [
        {
          id: uniqueId,
          name: selectedCategory,
          price: formattedPrice.toString(),
          quantity: "1",
        },
        {
          id: `${uniqueId}-admin`,
          name: "Admin Fee",
          price: adminFee.toString(),
          quantity: "1",
        },
      ],
      customer_details: {
        first_name: ketua, // Menggunakan nama pertama sebagai Nama Ketua
        phone: phone,
        notes: "Thankyou",
      },
      transaction_details: {
        order_id: uniqueId,
        gross_amount: totalPrice.toString(), // Menggunakan total harga
      },
    };
  };

  const generatePaymentLink = async () => {
    if (
      selectedCategory !== "NYMO Online Competition" &&
      selectedCategory !== "NYMO Offline Competition" 
    ) {
      alert(
        "Anda harus memilih salah satu kategori."
      );
      return;
    }

    if (!selectedNamaLengkap) {
      alert("Nama lengkap harus diisi.");
      return;
    } else if (selectedNamaLengkap.length > 180){
      alert(
        "Maksimal Penulisan Nama Ketua dan Anggota 180 karakter"
      )
    }

    if (!phone) {
      alert(
        "Nomor telepon ketua tim harus diisi untuk membuat tautan pembayaran."
      );
      return; // Menghentikan eksekusi fungsi jika phone belum diisi
    } else if (phone.length < 5 || phone.length > 20) {
      alert(
        "Nomor telepon harus memiliki panjang antara 5 hingga 20 karakter."
      );
      return; // Menghentikan eksekusi fungsi jika panjang phone tidak sesuai
    }

    if (!selectEmailKetua) {
      alert("Email Ketua harus diisi.");
      return;
    }

    if (!selectNameSupervisor) {
      alert("Nama Pembimbing harus diisi.");
      return;
    }

    if (!selectPhoneSupervisor) {
      alert(
        "Nomor telepon Pembimbing tim harus diisi untuk membuat tautan pembayaran."
      );
      return; // Menghentikan eksekusi fungsi jika phone belum diisi
    } else if (selectPhoneSupervisor.length < 5 || selectPhoneSupervisor.length > 20) {
      alert(
        "Nomor telepon pembimbing harus memiliki panjang antara 5 hingga 20 karakter."
      );
      return; // Menghentikan eksekusi fungsi jika panjang phone tidak sesuai
    }

    if (!selectEmailSupervisor) {
      alert("Email Pembimbing harus diisi.");
      return;
    }

    const newUniqueId = generateUniqueId(); // Menghasilkan uniqueId baru
    setUniqueId(newUniqueId); // Menyimpan uniqueId baru ke state

    const formData = generateFormData(
      selectedCategory,
      price,
      newUniqueId,
      selectedNamaLengkap,
      phone
    );

    const secret = process.env.NEXT_PUBLIC_SECRET;
    const encodedSecret = Buffer.from(secret).toString("base64");
    const basicAuth = `Basic ${encodedSecret}`;

    const apiUrl = `${process.env.NEXT_PUBLIC_API}/v1/payment-links`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: basicAuth,
        },
        body: JSON.stringify(formData),
      });

      const responseData = await response.json();
      console.log("Response Data:", responseData);
      setPaymentUrl(responseData.payment_url);

      const buttonInput = document.querySelector("form .buttonindo input");
      buttonInput.style.display = "block";
    } catch (error) {
      console.error("Error saat mengirim permintaan:", error);
    }
  };

  useEffect(() => {
    if (selectedCategory === "NYMO Online Competition") {
      setPrice("300000");
    } else if (selectedCategory === "NYMO Offline Competition") {
      setPrice("1150000");
    } else {
      setPrice("");
    }
  }, [selectedCategory]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  useEffect(() => {
    const scriptURL =
      "https://script.google.com/macros/s/AKfycbzewIia0bqX08Y6nYq9056Qkl2pP7ZfnJ94ige-VxsNok18lXvzoGLjXyBwzPN_VTF6Rw/exec";

    const form = document.forms["regist-form"];

    if (form) {
      const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          await fetch(scriptURL, { method: "POST", body: new FormData(form) });

          // Setelah berhasil mengirim data, arahkan pengguna ke halaman lain
          window.location.href = "/"; // Gantikan dengan URL halaman sukses Anda
        } catch (error) {
          console.error("Error saat mengirim data:", error);
          // Handle error jika diperlukan
        }

        form.reset();
      };

      form.addEventListener("submit", handleSubmit);

      // Membersihkan event listener saat komponen dilepas
      return () => {
        form.removeEventListener("submit", handleSubmit);
      };
    }
  }, []);

  return (
    <>
      <section className="registration-section">
        <div className="container">
          <div className="content">
            <h1 className="sub">FORMULIR PENDAFTARAN</h1>
            <h1 className="garis-bawah"></h1>
            <br></br>
            <h4>
              HALLO PESERTA NYMO 2024, Mohon perhatikan informasi berikut ini
              sebelum mengisi formulir pendaftaran :
            </h4>
            <br />
            <p>
              1. Mohon mengisi data yang diperlukan dengan benar dan memastikan
              tidak ada kesalahan penulisan. Pastikan juga bahwa data yang
              dikirim sudah final dan tidak mengalami perubahan.
            </p>
            <p>
              2. Pastikan{" "}
              <span className="fw-bold">&quot;INVOICE ID&quot;</span> sudah
              terbuat agar tombol untuk{" "}
              <span className="fw-bold">&quot;KIRIM &quot;</span> data bisa
              muncul.
            </p>
            <p>
              3. Setelah memastikan data sudah benar, Anda dapat mengklik tombol
              <span className="fw-bold"> &quot;KIRIM&quot;</span> cukup sekali
              saja. Jika data telah berhasil dikirimkan, Anda akan dipindahkan
              ke halaman lain.
            </p>
            <p>
              4. Akan ada email informasi bahwa pendaftaran telah diterima yang
              dikirimkan ke alamat email ketua tim, dan berkas akan divalidasi
              oleh tim kami. Mohon bersabar dan tunggu maksimal 3 hari setelah
              waktu pendaftaran, Letter of Acceptance (LOA) akan dikirimkan ke
              alamat email team leader.
            </p>
            <br></br>

            <form name="regist-form">
              <h1>BIODATA</h1>
              <h1 className="garis-bawah"></h1>
              <div className="user-details">
                <div className="input-box">
                  <label className="form-label" value="Peserta Indonesia">
                    Kategori Peserta
                  </label>
                  <input
                    type="text"
                    id="KATEGORI_PESERTA"
                    name="KATEGORI_PESERTA"
                    className="form-control"
                    placeholder="Choose Categories Participant"
                    value="PESERTA INDONESIA"
                    readOnly
                  />
                </div>
              </div>

              <div className="user-details">
                <div className="input-box">
                  <label htmlFor="NAMA_LENGKAP" className="form-label">
                    Nama Ketua & Anggota Tim
                  </label>
                  <label>
                    <p>
                      Masukan nama ketua dan anggota tim dengan nama ketua tim
                      diawal, dengan format seperti berikut :
                    </p>
                    <p>Note : maksimal 1 anggota + 1 ketua tim</p>
                    <h6>Kamal Putra</h6>
                    <h6>Ranu Ramadhan</h6>
                  </label>
                  <textarea
                    type="text"
                    id="NAMA_LENGKAP"
                    name="NAMA_LENGKAP"
                    className="form-control"
                    placeholder="Masukan Nama Ketua & Anggota"
                    required
                    value={selectedNamaLengkap}
                    onChange={(e) => setSelectedNamaLengkap(e.target.value)} // Menambahkan handler onChange
                  ></textarea>
                </div>
                <div className="input-box">
                  <label for="NISN_NIM" className="form-label">
                    NISN / NIM Ketua & Anggota Tim
                  </label>
                  <label>
                    <p>
                      Notes : Masukan NISN / NIM dengan sesuai urutan nama ketua
                      dan anggota tim, dengan format seperti berikut :
                    </p>
                    <h6>231700</h6>
                    <h6>241700</h6>
                  </label>
                  <textarea
                    type="text"
                    id="NISN_NIM"
                    name="NISN_NIM"
                    className="form-control"
                    placeholder="Masukan NISN / NIM Ketua & Anggota Tim"
                    required
                  ></textarea>
                </div>
                <div className="input-box">
                  <label htmlFor="WHATSAPP_KETUA" className="form-label">
                    Nomor WhatsApp Ketua Tim
                  </label>
                  <label>
                    <p>
                      Harap tulis dengan kode telepon, contoh : (kode negara)
                      (nomor telepon) +62 81770914xxxx
                    </p>
                    <p>
                      Notes : Dimohon untuk mengisi nomor ketua tim dengan
                      benar, untuk dimasukan kedalam group
                    </p>
                  </label>
                  <input
                    type="number"
                    id="WHATSAPP_KETUA"
                    name="WHATSAPP_KETUA"
                    className="form-control"
                    placeholder="Masukan Nomor WhatsApp Ketua Tim"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)} // Menambahkan handler onChange
                  />
                </div>
                <div className="input-box">
                  <label for="EMAIL_KETUA" className="form-label">
                    Alamat Email Ketua Tim
                  </label>
                  <label>
                    <p>
                      Notes : Dimohon untuk mengisi email dengan benar,
                      pengiriman LOA akan dikirim melalui email address ketua
                      tim yang di isi.
                    </p>
                  </label>
                  <input
                    type="email"
                    id="EMAIL_KETUA"
                    name="EMAIL_KETUA"
                    className="form-control"
                    placeholder="Masukan Alamat Email Ketua Tim"
                    required
                    value={selectEmailKetua}
                    onChange={(e) => setselectEmailKetua(e.target.value)}
                  />
                </div>
                
              </div>

              {/* DATA SEKOLAH START */}
              {/* DATA SEKOLAH START */}
              <h1>DATA SEKOLAH</h1>
              <h1 className="garis-bawah"></h1>
              <div className="user-details">
                <div className="input-box">
                  <label htmlFor="NAMA_SEKOLAH" className="form-label">
                    Nama Sekolah/Universitas
                  </label>
                  <label>
                    <p>
                      Notes : Masukan nama sekolah dengan format sesuai urutan
                      nama ketua dan anggota tim asal sekolah masing - masing,
                      dengan format seperti berikut :
                    </p>
                    <h6>SMA CERIA</h6>
                    <h6>SMA BAHAGIA</h6>
                  </label>
                  <textarea
                    type="text"
                    id="NAMA_SEKOLAH"
                    name="NAMA_SEKOLAH"
                    className="form-control"
                    placeholder="Masukan Nama Sekolah/Universitas Anda"
                    required
                  ></textarea>
                </div>
                <div className="input-box">
                  <label for="NPSN" className="form-label">
                    Nomor Pokok Sekolah Nasional (NPSN)
                  </label>
                  <label>
                    <p>
                      Notes : Masukan NPSN jika masi bersekolah dengan sesuai
                      urutan nama ketua dan anggota tim, dengan format seperti
                      berikut :
                    </p>
                    <h6>1201301</h6>
                    <h6>1302402</h6>
                  </label>
                  <textarea
                    type="number"
                    id="NPSN"
                    name="NPSN"
                    className="form-control"
                    placeholder="Masukan Nomor Pokok Sekolah Nasional (NPSN)"
                  ></textarea>
                </div>
                <div className="input-box">
                  <label for="JENJANG_PENDIDIKAN" className="form-label">
                    Jenjang Pendidikan{" "}
                  </label>
                  <select
                    type="text"
                    id="JENJANG_PENDIDIKAN"
                    name="JENJANG_PENDIDIKAN"
                    className="form-control"
                    placeholder="Pilih Jenjang Pendidikan"
                    required
                  >
                    <option value="">--Pilih Jenjang Pendidikan Anda--</option>
                    <option value="Sekolah Dasar">Sekolah Dasar</option>
                    <option value="Sekolah Menengah Pertama">
                      Sekolah Menengah Pertama
                    </option>
                    <option value="Sekolah Menengah Atas">
                      Sekolah Menengah Atas
                    </option>
                    <option value="Universitas">Universitas</option>
                  </select>
                </div>
                <div className="input-box">
                  <label for="PROVINSI" className="form-label">
                    Provinsi
                  </label>
                  <input
                    type="text"
                    id="PROVINSI"
                    name="PROVINSI"
                    className="form-control"
                    placeholder="Masukan Provinsi Anda"
                    required
                  />
                </div>
              </div>
              {/* DATA SEKOLAH END */}
              {/* DATA SEKOLAH END */}

              {/* DATA PEMBIMBING START */}
              {/* DATA PEMBIMBING START */}
              <h1>DATA PEMBIMBING</h1>
              <h1 className="garis-bawah"></h1>
              <div className="user-details">
                <div className="input-box">
                  <label for="NAMA_PEMBIMBING" className="form-label">
                    Nama Guru/Pembimbing
                  </label>
                  <textarea
                    type="text"
                    id="NAMA_PEMBIMBING"
                    name="NAMA_PEMBIMBING"
                    className="form-control"
                    placeholder="Masukan Nama Guru/Pembimbing"
                    required
                    value={selectNameSupervisor}
                    onChange={(e) => setselectNameSupervisor(e.target.value)}
                  ></textarea>
                </div>

                <div className="input-box">
                  <label
                    for="WHATSAPP_PEMBIMBING"
                    className="form-label"
                  >
                    Nomor WhatsApp Guru/Pembimbing
                  </label>
                  <label>
                    <p>
                      Harap tulis dengan kode telepon, contoh : (kode negara)
                      (nomor telepon) +62 81770914xxx
                    </p>
                  </label>
                  <input
                    type="number"
                    id="WHATSAPP_PEMBIMBING"
                    name="WHATSAPP_PEMBIMBING"
                    className="form-control"
                    placeholder="Masukan Nomor WhatsApp Guru/Pembimbing"
                    required
                    value={selectPhoneSupervisor}
                    onChange={(e) => setSelectPhoneSupervisor(e.target.value)}
                  />
                </div>

                <div className="input-box">
                  <label for="EMAIL_PEMBIMBING" className="form-label">
                    Alamat Email Guru/Pembimbing
                  </label>
                  <input
                    type="email"
                    id="EMAIL_PEMBIMBING"
                    name="EMAIL_PEMBIMBING"
                    className="form-control"
                    placeholder="Alamat Email Guru/Pembimbing"
                    required
                    value={selectEmailSupervisor}
                    onChange={(e) => setselectEmailSupervisor(e.target.value)}
                  />
                </div>
              </div>
              {/* DATA PEMBIMBING END */}
              {/* DATA PEMBIMBING END */}

              {/* INVOICE START */}
              {/* INVOICE START */}
              <div className="">
                <h1>INVOICE</h1>
                <h1 className="garis-bawah"></h1>
              </div>
              <div className="user-details">
                <div className="input-box">
                  <label html="KATEGORI_KOMPETISI" className="form-label">
                    Kategori Kompetisi
                  </label>
                  <select
                    type="text"
                    id="KATEGORI_KOMPETISI"
                    name="KATEGORI_KOMPETISI"
                    className="form-control"
                    placeholder="Choose Category Competition"
                    required
                    onChange={handleCategoryChange}
                    value={selectedCategory}
                  >
                    <option value="">--Pilih Kategori Kompetisi--</option>
                    <option value="NYMO Online Competition">
                      Kompetisi Online
                    </option>
                    <option value="NYMO Offline Competition">
                      Kompetisi Offline
                    </option>
                  </select>
                </div>
                <div className="mx-auto">
                  <p className="fw-bold">
                    *wajib di klik ketika sudah memilih kategori kompetisi
                  </p>
                  <button
                    className="btn btn-custom"
                    onClick={(e) => generatePaymentLink(e)}
                    disabled={
                      selectedCategory !== "NYMO Online Competition" &&
                      selectedCategory !== "NYMO Offline Competition" 
                    }
                  >
                    Buat Tautan Pembayaran
                  </button>
                </div>
              </div>
              <div className="user-details">
                <div className="input-box">
                  <label className="form-label">
                    Biaya yang harus dibayarkan{" "}
                    <span className="fw-bold">
                      (Belum Termasuk biaya Admin)
                    </span>
                  </label>
                  <input
                    type="text"
                    id="TOTAL_AMOUNT"
                    name="TOTAL_AMOUNT"
                    className="form-control"
                    placeholder="Total Biaya"
                    value={
                      price
                        ? (price / 1000).toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 3,
                          })
                        : ""
                    }
                    readOnly
                  />
                </div>
                <div className="input-box">
                  <label className="form-label">INVOICE ID</label>
                  <input
                    type="text"
                    id="ORDER_ID"
                    name="ORDER_ID"
                    className="form-control"
                    placeholder="ID PEMBAYARAN"
                    value={uniqueId}
                    readOnly
                  />
                </div>
                <div className="input-box invisible">
                  <label className="form-label">Link Invoice</label>
                  <input
                    type="text"
                    id="LINK_INVOICE"
                    name="LINK_INVOICE"
                    className="form-control"
                    placeholder="Link Pembayaran"
                    value={paymentUrl}
                  />
                </div>
              </div>
              {/* INVOICE END */}
              {/* INVOICE END */}

              {/* GENERAL INFORMATION START */}
              {/* GENERAL INFORMATION START */}
              <div className="">
                <h1>INFORMASI UMUM</h1>
                <h1 className="garis-bawah"></h1>
              </div>
              <div className="user-details">
                <div className="input-box">
                  <label for="ALAMAT" className="form-label">
                    Alamat Lengkap
                  </label>
                  <label>
                    <p>
                      Mohon tuliskan alamat lengkap (Nama Jalan, Nomor Rumah,
                      RT&RW, Kecamatan, Kabupaten, Kota, Provinsi, Kode Pos)
                    </p>
                  </label>
                  <textarea
                    type="text"
                    id="ALAMAT"
                    name="ALAMAT"
                    className="form-control"
                    placeholder="Masukan Alamat Lengkap Anda"
                    required
                  ></textarea>
                </div>
                <div className="input-box">
                  <label for="SUMBER_INFORMASI" className="form-label">
                    Sumber Informasi Kompetisi NYMO 2024
                  </label>
                  <select
                    type="text"
                    id="SUMBER_INFORMASI"
                    name="SUMBER_INFORMASI"
                    className="form-control"
                    placeholder="--Choose Information Resources-- "
                    required
                  >
                    <option value="">--Pilih Sumber Informasi--</option>
                    <option value="IYSA Instagram">IYSA Instagram</option>
                    <option value="NYMO Instagram">NYMO Instagram</option>
                    <option value="Pembimbing/Sekolah">
                      Pembimbing/Sekolah
                    </option>
                    <option value="IYSA FaceBook">IYSA FaceBook</option>
                    <option value="IYSA Linkedin">IYSA Linkedin</option>
                    <option value="IYSA Website">IYSA Website</option>
                    <option value="NYMO Website">NYMO Website</option>
                    <option value="IYSA Email">IYSA Email</option>
                    <option value="NYMO Email">NYMO Email</option>
                    <option value="Acara Sebelumnya">Acara Sebelumnya</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div className="input-box">
                  <label for="FILE" className="form-label">
                    Jika Anda mendapatkan pendaftaran gratis dari acara
                    sebelumnya atau kegiatan kunjungan sekolah sebelumnya, harap
                    lampirkan bukti dokumentasi{" "}
                  </label>
                  <input
                    type="url"
                    id="FILE"
                    name="FILE"
                    className="form-control"
                    placeholder="Upload Link File Drive"
                  />
                </div>
              </div>
              {/* GENERAL INFORMATION END */}
              {/* GENERAL INFORMATION END */}

              <div className="buttonindo">
                <input type="submit" value="KIRIM" />
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

export default IndoensiaParticipants;
