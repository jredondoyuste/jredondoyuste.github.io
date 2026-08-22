\ProvidesClass{mycv}[]
\LoadClass[12pt,a4paper]{article}
\usepackage[left=0.6in,top=0.8in,right=0.6in,bottom=1in]{geometry}
\usepackage[]{parskip}       % Do not indent paragraphs
\usepackage{array}           % required for boldface tabular columns
\usepackage{ifthen}
\usepackage[explicit]{titlesec}
\usepackage[normalem]{ulem}
\usepackage[utf8]{inputenc}
\usepackage[english, spanish]{babel}
\usepackage{multirow} 
\usepackage{fontawesome}

\renewcommand{\ULthickness}{.75pt}
\pagestyle{empty}               % resumes do not need page numbers

% DEFINE FONTS AND SIZES 
\def\namesize{\large}
\def\nameskip{\smallskip}
\def\addressskip{\smallskip}
\def\sectionskip{\smallskip} % was bigskip
\def\sectionlineskip{\smallskip}

% better fonts
\font\tenb=cmb10
\let\bf=\tenb
\font\tenbx=cmbx10

% Title information

\def \Sep {$\diamond$}         % Set default address seperator

\newcommand\name[1]{
    \MakeUppercase{\namesize{\textbf{#1}}}
    \nameskip \break
}

\newcommand\contact[3]{%
    \centerline{%
        \makebox[0pt][c]{%
            {#1}~\ \Sep\ ~{#2}~\ \Sep\ ~{#3}
        }%
    }%
    \medskip
}

% Define the content environment
\newenvironment{content}{%
    \par\noindent
    \renewcommand{\arraystretch}{1.1} % Adjust row spacing
    \begin{tabular}{@{}p{0.26\textwidth}p{0.6\textwidth} p{0.12\textwidth}@{}}}
    {\end{tabular}
    \par\vspace{0.5em} % Space between entries
}

% Command for entries inside content environment
\newcommand{\firstentry}[3]{
    \textbf{\MakeUppercase{#1}} & #2 & #3 \\
}

\newcommand{\altentry}[3]{
    #1 & #2 & #3 \\
}
\newcommand{\mainentry}[3]{
    \raggedleft #1 & #2 & #3 \\
}
\newcommand{\entry}[2]{
    & #1 & #2 \\
}