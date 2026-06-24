"use client";

import ShortUniqueId from "short-unique-id";
import { useState } from "react";
import { useStore } from "@repo/store";
import {
	firebaseGetUser,
	queryData,
	setData,
	updateData,
} from "@repo/firebase";
import { Section } from "@repo/ui/section";
import { Label, LabelInputContainer } from "@repo/ui/label";
import { Input } from "@repo/ui/input";
import { Select } from "@repo/ui/select";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";



export default function Login() {
	const { user, setUser, loading, setLoading } = useStore();
	const uid = new ShortUniqueId({
		length: 10,
		dictionary: "alphanum_upper",
	});

	const router = useRouter()

	useEffect(() => {
		if (!loading) {
			if (!user) {
				router.push("/");
			} else if (user.details) {
				router.push("/dashboard");
			}
		}
	}, [user, loading, router]);

	const [name, setName] = useState<string>(
		user?.user.displayName?.toUpperCase() || ""
	);
	const [email, setEmail] = useState<string>(user?.user.email || "");
	const [address, setAddress] = useState<string>("");
	const [college, setCollege] = useState<string>("");
	const [collegeCity, setCollegeCity] = useState<string>("");
	const [yearOfStudy, setYearOfStudy] = useState<string>("");
	const [gender, setGender] = useState<string>("");
	const [whatsapp, setWhatsapp] = useState<string>("");
	const [mobile, setMobile] = useState<string>(user?.user.phoneNumber || "");
	const [facebook, setFacebook] = useState<string>("");
	const [insta, setInsta] = useState<string>("");
	const [twitter, setTwitter] = useState<string>("");
	const [referrer, setReferrer] = useState<string>("");

	const awardPoint = async () => {
		try {
			const rawUsers = await queryData("CAs26", "id", referrer);
			if (rawUsers.length > 0) {
				const user = rawUsers[0];
				let points = user?.data.points;
				points += 10;
				await updateData("CAs26", user!.uid, { points: points });
			}
		} catch (error) {
			toast.error(`${error}`);
		}
	};

	// [SECURITY] Validate a URL field is either empty or a valid https:// URL
	const isValidUrl = (url: string) => url === "" || /^https:\/\/.+/.test(url);

	const register = async () => {
		try {
			// [SECURITY] Phone number digit-only and length check
			if (!/^\d{10}$/.test(mobile) || !/^\d{10}$/.test(whatsapp)) {
				toast.error("Please enter a valid 10-digit Mobile/Whatsapp Number");
				return;
			}

			// [SECURITY] Max-length guards on free-text fields to prevent storage abuse
			if (name.trim().length > 100) { toast.error("Name must be under 100 characters."); return; }
			if (college.trim().length > 150) { toast.error("College name must be under 150 characters."); return; }
			if (collegeCity.trim().length > 100) { toast.error("College city must be under 100 characters."); return; }
			if (address.trim().length > 300) { toast.error("Address must be under 300 characters."); return; }

			// [SECURITY] Social media fields must be valid https:// URLs if provided
			if (!isValidUrl(facebook)) { toast.error("Facebook link must be a valid https:// URL."); return; }
			if (!isValidUrl(insta)) { toast.error("Instagram link must be a valid https:// URL."); return; }
			if (!isValidUrl(twitter)) { toast.error("X/Twitter link must be a valid https:// URL."); return; }

			if (
				mobile != "" &&
				address !== "" &&
				college !== null &&
				college !== "" &&
				collegeCity !== "" &&
				yearOfStudy !== "" &&
				gender !== "" &&
				whatsapp !== ""
			) {
				const UserData = {
					id: `CA.ANT.${uid.rnd()}`,
					name: name.trim().slice(0, 100),
					email: email,
					phone: mobile,
					whatsapp: whatsapp,
					gender: gender,
					address: address.trim().slice(0, 300),
					college: college.trim().toUpperCase().slice(0, 150),
					collegeCity: collegeCity.trim().slice(0, 100),
					year: yearOfStudy,
					fb: facebook.trim().slice(0, 200),
					insta: insta.trim().slice(0, 200),
					twitter: twitter.trim().slice(0, 200),
					points: 0,
				};
				const isSuccess = await setData("CAs26", user!.user.uid, UserData);
				if (!isSuccess) {
					toast.error("Failed to register. Please check your connection or contact support.");
					return;
				}
				setUser({ user: user!.user, details: UserData });
				router.push("/dashboard")
				toast.success("Registered Successfully!")
				if (referrer !== "") {
					awardPoint();
				}
			} else {
				toast.error("Please fill all the required fields");
			}
		} catch (error) {
			// [SECURITY] Do not expose raw Firebase error to user
			console.error("Registration error:", error);
			toast.error("Registration failed. Please try again.");
		}
	};

	if (loading || !user) return <div className="h-screen flex items-center justify-center">Loading...</div>;

	return (
		<div className="bg-background min-h-screen">
			<Section className="min-h-screen flex flex-col items-center justify-center gap-5 pt-16">
				<div className="heading text-2xl md:!text-4xl lg:!text-6xl">
					ANTARAGNI 26
				</div>
				<div className="shadow-input h-[80%] w-[80%] backdrop-blur-lg rounded-xl border-1 p-3 flex flex-col items-center justify-center overflow-hidden text-[var(--white)]">
					<div className=" text-2xl md:!text-4xl lg:!text-5xl font-bold">
						Register
					</div>
					<div className="text-xl md:!text-3xl lg:!text-4xl text-center">
						Please enter your details to register
					</div>
					<form className="w-full my-8 flex flex-wrap gap-5 items-center justify-center overflow-auto p-2" data-lenis-prevent>
						<LabelInputContainer className="mb-4">
							<Label htmlFor="name">Name*</Label>
							<Input
								id="name"
								placeholder="Enter your name"
								value={name}
								required
								type="text"
								onChange={(e) => {
									setName(e.target.value.toUpperCase());
								}}
							/>
						</LabelInputContainer>
						<LabelInputContainer className="mb-4">
							<Label htmlFor="email">Email Id*</Label>
							<Input
								id="email"
								placeholder="Enter your email-id"
								value={email}
								required
								type="email"
								onChange={(e) => {
									setEmail(e.target.value);
								}}
							/>
						</LabelInputContainer>
						<LabelInputContainer className="mb-4">
							<Label htmlFor="mobile">Mobile*</Label>
							<Input
								id="mobile"
								placeholder="Enter your 10 digit mobile number"
								value={mobile}
								required
								type="text"
								onChange={(e) => {
									setMobile(e.target.value);
								}}
							/>
						</LabelInputContainer>
						<LabelInputContainer className="mb-4">
							<Label htmlFor="whatsapp">WhatsApp Number*</Label>
							<Input
								id="whatsapp"
								placeholder="Enter your 10 digit WhatsApp number"
								value={whatsapp}
								required
								type="text"
								onChange={(e) => {
									setWhatsapp(e.target.value);
								}}
							/>
						</LabelInputContainer>
						<LabelInputContainer className="mb-4">
							<Label htmlFor="address">Postal Address*</Label>
							<Input
								id="address"
								placeholder="Enter your postal address"
								value={address}
								required
								type="text"
								onChange={(e) => {
									setAddress(e.target.value);
								}}
							/>
						</LabelInputContainer>
						<LabelInputContainer className="mb-4">
							<Label htmlFor="gender">Gender*</Label>
							<Select
								value={gender}
								onValueChange={setGender}
								placeholder="Select Gender"
								options={[
									{ label: "MALE", value: "MALE"},
									{ label: "FEMALE", value: "FEMALE"},
									{ label: "OTHER", value: "OTHER"}
								]}
							/>
						</LabelInputContainer>
						<LabelInputContainer className="mb-4">
							<Label htmlFor="college">College Name*</Label>
							<Input
								id="college"
								placeholder="Enter your college name"
								value={college}
								required
								type="text"
								onChange={(e) => {
									setCollege(e.target.value);
								}}
							/>
						</LabelInputContainer>
						<LabelInputContainer className="mb-4">
							<Label htmlFor="collegeCity">College City*</Label>
							<Input
								id="collegeCity"
								placeholder="Enter your college city"
								value={collegeCity}
								required
								type="text"
								onChange={(e) => {
									setCollegeCity(e.target.value);
								}}
							/>
						</LabelInputContainer>
						<LabelInputContainer className="mb-4">
							<Label htmlFor="yearOfStudy">Year of Study*</Label>
							<Select
								value={yearOfStudy}
								onValueChange={setYearOfStudy}
								placeholder="Select Year of Study"
								options={[
									{label: "FIRST YEAR", value: "FIRST YEAR"},
									{label: "SECOND YEAR", value: "SECOND YEAR"},
									{label: "THIRD YEAR", value: "THIRD YEAR"},
									{label: "FOURTH YEAR", value: "FOURTH YEAR"},
									{label: "5+ YEARS", value: "5+ YEARS"},
									{label: "CLASS 8 ", value: "CLASS 8 "},
									{label: "CLASS 9 ", value: "CLASS 9 "},
									{label: "CLASS 10 ", value: "CLASS 10 "},
									{label: "CLASS 11 ", value: "CLASS 11 "},
									{label: "CLASS 12 ", value: "CLASS 12 "}
								]}
							/>
						</LabelInputContainer>
						<LabelInputContainer className="mb-4">
							<Label htmlFor="facebook">Facebook Profile</Label>
							<Input
								id="facebook"
								placeholder="Link to your Facebook Profile"
								value={facebook}
								type="text"
								onChange={(e) => {
									setFacebook(e.target.value);
								}}
							/>
						</LabelInputContainer>
						<LabelInputContainer className="mb-4">
							<Label htmlFor="insta">Instagram Profile</Label>
							<Input
								id="insta"
								placeholder="Link to your Instagram Profile"
								value={insta}
								type="text"
								onChange={(e) => {
									setInsta(e.target.value);
								}}
							/>
						</LabelInputContainer>
						<LabelInputContainer className="mb-4">
							<Label htmlFor="twitter">X Profile</Label>
							<Input
								id="twitter"
								placeholder="Link to your X Profile"
								value={twitter}
								type="text"
								onChange={(e) => {
									setTwitter(e.target.value);
								}}
							/>
						</LabelInputContainer>
						<LabelInputContainer className="mb-4">
							<Label htmlFor="referrer">Referrer CA Id</Label>
							<Input
								id="referrer"
								placeholder="Enter CA Id of the referrer CA"
								value={referrer}
								type="text"
								onChange={(e) => {
									setReferrer(e.target.value);
								}}
							/>
						</LabelInputContainer>
					</form>
						<button 
							className="mt-6 bg-accent hover:bg-red-600 text-white px-8 py-3 rounded-full font-sans font-medium uppercase tracking-[0.12em] transition-all duration-300" 
							onClick={register}
						>
							Register &rarr;
						</button>
				</div>
			</Section>
		</div>
	);
}
