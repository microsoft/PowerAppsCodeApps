import { BasePage } from '../components'
import { Text, Title1 } from '@fluentui/react-components'

interface StarterPageProps {
    title: string
}

const StarterPage: React.FC<StarterPageProps> = ({ title }) => {
    const header = <Title1>{title}</Title1>;

    return (
        <BasePage header={header}>
            <Text size={400}>
                Replace with your own page...
            </Text>
        </BasePage>
    )
}

export default StarterPage
