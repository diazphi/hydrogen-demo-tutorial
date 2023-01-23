import {Heading, Section, Text} from '~/components';
import { FaArrowDown } from 'react-icons/fa';
import './css/custom.css';
export function CollectionFilter() {

    const OnClickSort = event => {
        console.log(event.target.closest('.sort-title'));
        if(event.target.closest('.sort-title')) {
            event.target.closest('.collection-filter-container').classList.toggle('show');
        }       
    }

    const onSortParam = event => {
        const url = new URL(window.location.href);
        url.searchParams.set('sortkey', event.target.closest('li').getAttribute('data-sort-key'));
        url.searchParams.set('reverse', event.target.closest('li').getAttribute('data-sort-reverse'));
        if(event.target.closest('.collection-filter-container').classList.contains('show')) {
            window.location.href = url.toString();
        }      
    }

    return (
        <Section>
            <div className="collection-filter-container" onClick={OnClickSort}>
                <p className="sort-title">SortBy <FaArrowDown /></p>
                <ul>
                    <li data-sort-key="MANUAL" data-sort-reverse="false" onClick={onSortParam}>Featured</li>
                    <li data-sort-key="TITLE" data-sort-reverse="false" onClick={onSortParam}>Alphabetically, A-Z</li>
                    <li data-sort-key="PRICE" data-sort-reverse="true" onClick={onSortParam}>Price, High-low </li>
                </ul>
            </div>       
        </Section>
    )
}