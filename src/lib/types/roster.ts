export type Player = {
	firstName: string;
	lastName: string;
	fullName: string;
	jerseyNumber: string | null;
	position: string | null;
	academicYear: string | null;
	height: string | null;
	hometown: string | null;
	highSchool: string | null;
	previousSchool: string | null;
	major: string | null;
	bioUrl: string | null;
	headshotUrl: string | null;
};

export type Coach = {
	name: string;
	title: string | null;
	bioUrl: string | null;
	headshotUrl: string | null;
};

export type Platform = "nextgen" | "classic";

export type RosterResult = {
	sourceUrl: string;
	platform: Platform;
	schoolHost: string;
	sportSlug: string;
	title: string | null;
	season: string | null;
	players: Player[];
	coaches: Coach[];
};

export type SportInfo = {
	slug: string;
	title: string;
};
