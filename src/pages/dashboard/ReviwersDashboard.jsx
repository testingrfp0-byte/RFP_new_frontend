
import FilterStatus from "../../components/ui/FilterStatus";
import ReviewerQuestionsList from "../list/ReviewerQuestionsList";
import ToasterNotification from "../../components/ui/ToasterNotification";

const ReviewersDashboard = ({ isDarkMode, selfAssignMode }) => {
    return (
        <div className={`min-h-screen p-4 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>


            <div className="max-w-7xl mx-auto">
                <FilterStatus isDarkMode={isDarkMode} />
                <ReviewerQuestionsList
                    isDarkMode={isDarkMode}
                    selfAssignMode={selfAssignMode}
                />
            </div>
            <ToasterNotification />
        </div>
    );
};

export default ReviewersDashboard;
