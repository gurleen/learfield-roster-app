import Root, { type NavbarProps } from './navbar.svelte';
import Group, { type NavbarGroupAlign, type NavbarGroupProps } from './navbar-group.svelte';
import Heading, { type NavbarHeadingProps } from './navbar-heading.svelte';
import Divider, { type NavbarDividerProps } from './navbar-divider.svelte';

export {
	Root,
	Group,
	Heading,
	Divider,
	//
	Root as Navbar,
	Group as NavbarGroup,
	Heading as NavbarHeading,
	Divider as NavbarDivider,
	type NavbarProps,
	type NavbarGroupProps,
	type NavbarGroupAlign,
	type NavbarHeadingProps,
	type NavbarDividerProps
};
